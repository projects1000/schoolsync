package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.*;
import com.littlesteps.playschool.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentRemarkService {

    @Autowired
    private StudentRemarkRepository studentRemarkRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    public StudentRemark addRemark(String email, String studentId, String title, String description,
            StudentRemark.RemarkType type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!hasPermission(user, studentId)) {
            throw new RuntimeException("Unauthorized: Only Class Teacher can add remarks.");
        }

        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        StudentRemark remark = new StudentRemark(studentId, teacher.getId(), title, description, type);
        return studentRemarkRepository.save(remark);
    }

    public List<StudentRemark> getRemarks(String email, String studentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Allow Class Teacher, Admin, and Parents (if linked) to view
        // For now, simplify to just checking if they have access to the student
        // But for Class Teacher logic, let's reuse the permission check or similar.
        // Admins always allowed.
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.SUPERADMIN) {
            return studentRemarkRepository.findByStudentId(studentId);
        }

        // Check if Class Teacher
        if (hasPermission(user, studentId)) {
            return studentRemarkRepository.findByStudentId(studentId);
        }

        // TODO: Add parent check here if needed later.

        throw new RuntimeException("Unauthorized to view remarks.");
    }

    private boolean hasPermission(User user, String studentId) {
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.SUPERADMIN) {
            return true;
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Classes classes = classesRepository.findById(student.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (classes.getClassTeacherId() == null) {
            return false;
        }

        Teacher teacher = teacherRepository.findById(classes.getClassTeacherId())
                .orElse(null);

        return teacher != null && teacher.getUser().getId().equals(user.getId());
    }
}
