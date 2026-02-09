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

    public Message sendMessage(String email, String classId, String content, String recipientId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        boolean isClassTeacher = teacher.getAssignedClasses() != null && teacher.getAssignedClasses().contains(classId);
        boolean isSubjectTeacher = classSubjectRepository.existsByClassIdAndTeacherId(classId, teacher.getId());

        if (!isClassTeacher && !isSubjectTeacher) {
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

        boolean isClassTeacher = teacher.getAssignedClasses() != null && teacher.getAssignedClasses().contains(classId);
        boolean isSubjectTeacher = classSubjectRepository.existsByClassIdAndTeacherId(classId, teacher.getId());

        if (!isClassTeacher && !isSubjectTeacher) {
            throw new RuntimeException("Unauthorized access to class messages.");
        }

        // Return messages for this class, sorted by newest first
        return messageRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(m -> m.getClassId().equals(classId))
                .toList();
    }
}
