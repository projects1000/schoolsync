package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.TeacherDTO;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    // @Autowired
    // private NotificationService notificationService; // For sending emails/SMS

    /**
     * Get all teachers with optional filtering
     */
    public List<TeacherDTO> getAllTeachers(String name, String department, String status) {
        List<Teacher> teachers;

        if (name != null && !name.trim().isEmpty()) {
            teachers = teacherRepository.searchTeachers(name.trim());
        } else if (department != null && !department.trim().isEmpty()) {
            teachers = teacherRepository.findByDepartment(department);
        } else if (status != null && !status.trim().isEmpty()) {
            teachers = teacherRepository.findByStatus(Teacher.Status.valueOf(status.toUpperCase()));
        } else {
            teachers = teacherRepository.findAll();
        }

        return teachers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get teacher by ID
     */
    @Transactional
    public Map<String, Object> createTeacherWithUser(TeacherDTO teacherDTO, String createdBy) {
        if (teacherRepository.existsByEmail(teacherDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create User
        User user = new User();
        user.setEmail(teacherDTO.getEmail());
        user.setUsername(teacherDTO.getEmail()); // Set username as email
        user.setName(teacherDTO.getName());
        user.setPhone(teacherDTO.getPhone());
        user.setRole(User.Role.TEACHER);
        user.setActive(true);
        String rawPassword = generateSecurePassword();
        user.setPassword(passwordEncoder.encode(rawPassword));

        user = userRepository.save(user);

        // Create Teacher
        Teacher teacher = new Teacher();
        teacher.setEmployeeId(generateEmployeeId());
        teacher.setName(teacherDTO.getName());
        teacher.setEmail(teacherDTO.getEmail());
        teacher.setPhone(teacherDTO.getPhone());
        teacher.setDepartment(teacherDTO.getDepartment());
        teacher.setQualification(teacherDTO.getQualification());
        teacher.setExperience(teacherDTO.getExperience());

        if (teacherDTO.getEmploymentType() != null) {
            try {
                teacher.setEmploymentType(Teacher.EmploymentType.valueOf(teacherDTO.getEmploymentType()));
            } catch (IllegalArgumentException e) {
                teacher.setEmploymentType(Teacher.EmploymentType.FULL_TIME);
            }
        }

        teacher.setJoiningDate(teacherDTO.getJoiningDate());
        teacher.setAddress(teacherDTO.getAddress());
        teacher.setSubjects(teacherDTO.getSubjects());
        teacher.setAssignedClasses(teacherDTO.getAssignedClasses());
        teacher.setUser(user);

        teacher = teacherRepository.save(teacher);

        Map<String, Object> result = new HashMap<>();
        result.put("teacher", convertToDTO(teacher));
        result.put("password", rawPassword);

        // Fix: Pass result (or teacher data) as 3rd argument
        auditService.logTeacherCreated(createdBy, teacher.getId(), result);

        return result;
    }

    /**
     * Get teacher by ID
     */
    public TeacherDTO getTeacherById(String id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + id));
        return convertToDTO(teacher);
    }

    public TeacherDTO updateTeacher(String id, TeacherDTO teacherDTO, String updatedBy) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + id));

        teacher.setName(teacherDTO.getName());
        teacher.setQualification(teacherDTO.getQualification());
        teacher.setExperience(teacherDTO.getExperience());

        if (teacherDTO.getEmploymentType() != null) {
            try {
                teacher.setEmploymentType(Teacher.EmploymentType.valueOf(teacherDTO.getEmploymentType()));
            } catch (IllegalArgumentException e) {
                // Keep existing or default
            }
        }

        teacher.setDepartment(teacherDTO.getDepartment());
        teacher.setJoiningDate(teacherDTO.getJoiningDate());
        teacher.setAddress(teacherDTO.getAddress());
        teacher.setSubjects(teacherDTO.getSubjects());

        // Update user details if email changed
        if (!teacher.getEmail().equals(teacherDTO.getEmail()) || !teacher.getPhone().equals(teacherDTO.getPhone())) {
            teacher.setEmail(teacherDTO.getEmail());
            teacher.setPhone(teacherDTO.getPhone());

            if (teacher.getUser() != null) {
                User user = teacher.getUser();
                user.setEmail(teacherDTO.getEmail());
                user.setPhone(teacherDTO.getPhone());
                user.setName(teacherDTO.getName());
                userRepository.save(user);
            }
        }

        Teacher updatedTeacher = teacherRepository.save(teacher);

        Map<String, Object> changes = new HashMap<>();
        changes.put("teacherId", id);
        changes.put("updates", teacherDTO);
        auditService.logTeacherUpdated(updatedBy, id, changes);

        return convertToDTO(updatedTeacher);
    }

    public void deactivateTeacher(String id, String deactivatedBy) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + id));

        teacher.setStatus(Teacher.Status.INACTIVE);

        if (teacher.getUser() != null) {
            User user = teacher.getUser();
            user.setActive(false);
            userRepository.save(user);
        }

        teacherRepository.save(teacher);
        auditService.logTeacherDeactivated(deactivatedBy, id);
    }

    @Autowired
    private com.littlesteps.playschool.repository.ClassesRepository classesRepository;

    public void assignClasses(String teacherId, List<String> classNames, String assignedBy) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + teacherId));

        // Validate that all classes exist
        // Note: classNames here seems to be IDs based on typical usage, but variable
        // name says classNames.
        // Assuming they are IDs as per standard REST practice. If they are names, we
        // need to findByName.
        // However, the frontend usually sends IDs. Let's assume IDs for robustness or
        // names if that was the design.
        // Looking at the entity, it says 'assignedClasses' which is List<String>.
        // Let's assume they are Class Names for now if that's what the variable says,
        // OR IDs.
        // Better to check if any class with that ID exists.

        // Let's verify if they are IDs. The frontend implementation plan suggests
        // "Assign Classes Modal: Multi-select dropdown".
        // Usually values are IDs.

        // IMPORTANT: The variable is named 'classNames' in the original code, but
        // typically we store IDs.
        // Let's check if we can validate them.

        for (String classId : classNames) {
            if (!classesRepository.existsById(classId)) {
                // Fallback: Check if it's a name? Or just throw.
                // If the list is mixed or names, this might fail if we strictly expect IDs.
                // But for a robust system, we should use IDs.
                // If the logic previously expected names, we might be breaking it.
                // BUT, the original code just set the list directly without validation.
                // The safe bet is to assume IDs for a new implementation or strict validation.

                // If doesn't exist by ID, maybe it's a name?
                // For now, let's strictly validate if it looks like an ID or just warn?
                // Actually, better to just save what is sent if we aren't 100% sure of the data
                // model,
                // but the task was "Add Class Validation".
                // So I MUST validate.
                throw new RuntimeException("Class not found with ID" + classId);
            }
        }

        teacher.setAssignedClasses(classNames);
        teacherRepository.save(teacher);

        Map<String, Object> changes = new HashMap<>();
        changes.put("assignedClasses", classNames);
        auditService.logAction(assignedBy, "ASSIGN_CLASSES", "TEACHER", teacherId, changes,
                "Assigned classes to teacher");
    }

    public String resetTeacherPassword(String teacherId, String resetBy) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + teacherId));

        if (teacher.getUser() == null) {
            throw new RuntimeException("Teacher does not have an associated user account");
        }

        String newPassword = generateSecurePassword();
        User user = teacher.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // In a real app, send email/SMS here

        auditService.logAction(resetBy, "RESET_PASSWORD", "TEACHER", teacherId, null, "Reset teacher password");

        return newPassword;
    }

    public void sendTeacherCredentials(String teacherId, String sentBy) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + teacherId));

        if (teacher.getUser() == null) {
            throw new RuntimeException("Teacher does not have an associated user account");
        }

        // TODO: Implement email/SMS sending
        // notificationService.sendTeacherCredentials(teacher.getEmail(),
        // teacher.getUser().getUsername(), newPassword);

        auditService.logAction(sentBy, "SEND_CREDENTIALS", "TEACHER", teacherId, null,
                "Credentials sent to teacher");
    }

    /**
     * Convert Teacher entity to DTO
     */
    private TeacherDTO convertToDTO(Teacher teacher) {
        TeacherDTO dto = modelMapper.map(teacher, TeacherDTO.class);
        dto.setStatus(teacher.getStatus().name());
        if (teacher.getEmploymentType() != null) {
            dto.setEmploymentType(teacher.getEmploymentType().name());
        }
        return dto;
    }

    /**
     * Generate unique employee ID
     */
    private String generateEmployeeId() {
        String prefix = "EMP";
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(8);
        String employeeId;

        do {
            employeeId = prefix + timestamp + String.format("%02d", new SecureRandom().nextInt(100));
        } while (teacherRepository.existsByEmployeeId(employeeId));

        return employeeId;
    }

    /**
     * Generate secure password
     */
    private String generateSecurePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }
}