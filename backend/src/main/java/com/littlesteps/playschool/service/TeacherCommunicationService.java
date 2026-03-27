package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.Message;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.MessageRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class TeacherCommunicationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ClassSubjectRepository classSubjectRepository;

        @Autowired
        private com.littlesteps.playschool.repository.ClassesRepository classesRepository;

    public Message sendMessage(String email, String classId, String content, String recipientId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!isTeacherAssignedToClass(teacher, classId)) {
            throw new RuntimeException("Unauthorized: You are not assigned to this class.");
        }

        Message message = new Message();
        message.setSenderId(teacher.getId());
        message.setSenderName(user.getName());
        message.setClassId(classId);
        message.setRecipientId(recipientId != null && !recipientId.isEmpty() ? recipientId : "ALL");
        message.setContent(content);

        return messageRepository.save(message);
    }

    public List<Message> getMessagesByClass(String email, String classId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!isTeacherAssignedToClass(teacher, classId)) {
            throw new RuntimeException("Unauthorized access to class messages.");
        }

        // Return messages for this class, sorted by newest first
        return messageRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(m -> m.getClassId().equals(classId))
                .toList();
    }

    @Autowired
    private com.littlesteps.playschool.repository.CommunicationRepository communicationRepository;

    public List<com.littlesteps.playschool.entity.Communication> getTeacherInbox(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Get both direct messages to this teacher and broadcasts to all teachers
        return communicationRepository.findAllByOrderByCreatedAtDesc().stream()
                                // Only keep communications where schoolId matches, guarding against nulls
                                .filter(c -> Objects.equals(c.getSchoolId(), user.getSchoolId()))
                                // Keep direct messages to this teacher or broadcasts to all teachers
                                .filter(c -> {
                                        com.littlesteps.playschool.entity.Communication.RecipientType type = c.getRecipientType();
                                        if (type == com.littlesteps.playschool.entity.Communication.RecipientType.ALL_TEACHERS) {
                                                return true;
                                        }
                                        if (type == com.littlesteps.playschool.entity.Communication.RecipientType.TEACHER) {
                                                java.util.Set<String> recipientIds = c.getRecipientIds();
                                                return recipientIds != null && recipientIds.contains(teacher.getId());
                                        }
                                        return false;
                                })
                .toList();
    }

    /**
     * Checks whether the given teacher is associated with the class either as a
     * class teacher, subject teacher or via the legacy assignedClasses list.
     * This mirrors the consolidated logic used in TeacherAssignmentService so that
     * any class visible in /teacher/classes is also valid for communications.
     */
    private boolean isTeacherAssignedToClass(Teacher teacher, String classId) {
        boolean isAssignedInList = teacher.getAssignedClasses() != null
                && teacher.getAssignedClasses().contains(classId);

        boolean isSubjectTeacher = classSubjectRepository.existsByClassIdAndTeacherId(classId, teacher.getId());

        boolean isClassTeacher = classesRepository.findByClassTeacherId(teacher.getId())
                .stream()
                .anyMatch(cls -> classId != null && classId.equals(cls.getId()));

        return isAssignedInList || isSubjectTeacher || isClassTeacher;
    }
}
