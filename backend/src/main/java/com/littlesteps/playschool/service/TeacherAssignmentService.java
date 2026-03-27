package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.Assignment;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.AssignmentRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TeacherAssignmentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ClassSubjectRepository classSubjectRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ClassesRepository classesRepository;

    private final String uploadDir = "uploads/assignments/";

    @Transactional
    public Assignment createAssignment(String email, String title, String description, LocalDate dueDate,
            String classId, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!isTeacherAssignedToClass(teacher, classId)) {
            throw new RuntimeException("Unauthorized: Teacher is not assigned to this class.");
        }

        String attachmentUrl = null;
        if (file != null && !file.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            attachmentUrl = "/uploads/assignments/" + filename;
        }

        Assignment assignment = new Assignment();
        assignment.setTitle(title);
        assignment.setDescription(description);
        assignment.setDueDate(dueDate);
        assignment.setClassId(classId);
        assignment.setTeacherId(teacher.getId());
        assignment.setAttachmentUrl(attachmentUrl);

        return assignmentRepository.save(assignment);
    }

    public Page<Assignment> getPaginatedAssignmentsByClass(String email, String classId, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!isTeacherAssignedToClass(teacher, classId)) {
            throw new RuntimeException("Unauthorized access to class assignments.");
        }

        return assignmentRepository.findByClassId(classId, pageable);
    }

    /**
     * Checks whether the given teacher is associated with the class either as a
     * class teacher, subject teacher or via the legacy assignedClasses list.
     * This mirrors the consolidated logic used in TeacherDashboardService so that
     * any class visible in /teacher/classes is also valid for assignments.
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
