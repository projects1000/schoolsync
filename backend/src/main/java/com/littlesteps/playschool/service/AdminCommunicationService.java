package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.Communication;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.CommunicationRepository;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.ParentStudentMapRepository;
import com.littlesteps.playschool.repository.ParentRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.entity.ParentStudentMap;
import com.littlesteps.playschool.entity.Student;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AdminCommunicationService {

    @Autowired
    private CommunicationRepository communicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ParentStudentMapRepository parentStudentMapRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ParentRepository parentRepository;

    public Communication sendDirectMessage(String email, Map<String, String> payload) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals(User.Role.ADMIN) && !admin.getRole().equals(User.Role.SUPERADMIN)) {
            throw new RuntimeException("Unauthorized: Only Admins can send communications");
        }

        String schoolId = admin.getSchoolId();
        String subject = payload.get("subject");
        String body = payload.get("body");
        String recipientTypeStr = payload.get("recipientType");
        String recipientId = payload.get("recipientId");

        Communication.RecipientType recipientType = Communication.RecipientType.valueOf(recipientTypeStr);

        Communication comm = new Communication(
                subject, body, Communication.MessageType.INDIVIDUAL,
                admin.getId(), admin.getName(), Communication.SenderRole.ADMIN, schoolId);

        comm.setRecipientType(recipientType);

        if (recipientType == Communication.RecipientType.TEACHER) {
            Teacher teacher = teacherRepository.findById(recipientId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            comm.addRecipient(teacher.getId(), teacher.getName());
        } else if (recipientType == Communication.RecipientType.PARENT) {
            User parent = userRepository.findById(recipientId)
                    .orElseThrow(() -> new RuntimeException("Parent not found"));
            comm.addRecipient(parent.getId(), parent.getName());

            // Optional: tag to a specific class if passed
            String targetClassId = payload.get("targetClassId");
            if (targetClassId != null) {
                comm.setTargetClassId(targetClassId);
            }

            // Tag to specific student to prevent isolation leaks (other children won't see
            // it)
            String targetStudentId = payload.get("targetStudentId");
            if (targetStudentId != null) {
                comm.setTargetStudentId(targetStudentId);
            }
        } else {
            throw new RuntimeException("Invalid recipient type for direct message.");
        }

        comm.markAsReadBy(admin.getId()); // Sender has inherently read it
        return communicationRepository.save(comm);
    }

    public Communication sendBroadcast(String email, Map<String, String> payload) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals(User.Role.ADMIN) && !admin.getRole().equals(User.Role.SUPERADMIN)) {
            throw new RuntimeException("Unauthorized: Only Admins can send communications");
        }

        String schoolId = admin.getSchoolId();
        String subject = payload.get("subject");
        String body = payload.get("body");
        String recipientTypeStr = payload.get("recipientType");

        Communication.RecipientType recipientType = Communication.RecipientType.valueOf(recipientTypeStr);

        Communication comm = new Communication(
                subject, body, Communication.MessageType.BROADCAST,
                admin.getId(), admin.getName(), Communication.SenderRole.ADMIN, schoolId);

        comm.setRecipientType(recipientType);

        if (recipientType == Communication.RecipientType.ALL_TEACHERS) {
            List<Teacher> teachers = teacherRepository.findBySchoolId(schoolId);
            for (Teacher t : teachers) {
                comm.addRecipient(t.getId(), t.getName());
            }
        } else if (recipientType == Communication.RecipientType.ALL_PARENTS) {
            // Find all parents in the school
            List<User> parents = userRepository.findBySchoolIdAndRole(schoolId, User.Role.PARENT);
            for (User p : parents) {
                comm.addRecipient(p.getId(), p.getName());
            }
        } else if (recipientType == Communication.RecipientType.CLASS_PARENTS) {
            String targetClassId = payload.get("targetClassId");
            if (targetClassId == null) {
                throw new RuntimeException("Target class ID is required for class parents broadcast.");
            }
            comm.setTargetClassId(targetClassId);

            // Find all students in this class
            List<Student> students = studentRepository.findByClassId(targetClassId);
            Set<String> uniqueParentIds = new HashSet<>();

            for (Student student : students) {
                List<ParentStudentMap> mappings = parentStudentMapRepository.findByStudentId(student.getId());
                for (ParentStudentMap map : mappings) {
                    uniqueParentIds.add(map.getParentId());
                }
            }

            for (String parentId : uniqueParentIds) {
                // Find parent user to get name
                parentRepository.findById(parentId).ifPresent(parent -> {
                    if (parent.getUserId() != null) {
                        userRepository.findById(parent.getUserId())
                                .ifPresent(p -> comm.addRecipient(p.getId(), p.getName()));
                    }
                });
            }
        } else {
            throw new RuntimeException("Invalid recipient type for broadcast message.");
        }

        comm.markAsReadBy(admin.getId());
        return communicationRepository.save(comm);
    }

    public List<Communication> getHistory(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals(User.Role.ADMIN) && !admin.getRole().equals(User.Role.SUPERADMIN)) {
            throw new RuntimeException("Unauthorized: Only Admins can view communications");
        }

        return communicationRepository.findBySchoolIdAndSenderRole(admin.getSchoolId(), Communication.SenderRole.ADMIN);
    }
}
