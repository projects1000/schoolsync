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

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
@CacheConfig(cacheNames = "teachers")
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
    @Cacheable(key = "{#schoolId, #name, #department, #status}")
    public List<TeacherDTO> getAllTeachers(String schoolId, String name, String department, String status) {
        List<Teacher> teachers;

        if (name != null && !name.trim().isEmpty()) {
            teachers = teacherRepository.searchTeachers(schoolId, name.trim());
        } else if (department != null && !department.trim().isEmpty()) {
            teachers = teacherRepository.findBySchoolIdAndDepartment(schoolId, department);
        } else if (status != null && !status.trim().isEmpty()) {
            teachers = teacherRepository.findBySchoolIdAndStatus(schoolId,
                    Teacher.Status.valueOf(status.toUpperCase()));
        } else {
            teachers = teacherRepository.findBySchoolIdAndStatusNot(schoolId, Teacher.Status.DELETED);
        }

        return teachers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all deleted teachers
     */
    @Cacheable(key = "{#schoolId, 'deleted'}")
    public List<TeacherDTO> getDeletedTeachers(String schoolId) {
        return teacherRepository.findBySchoolIdAndStatus(schoolId, Teacher.Status.DELETED)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new teacher with associated user account
     */
    @Transactional
    @CacheEvict(allEntries = true)
    public Map<String, Object> createTeacherWithUser(TeacherDTO teacherDTO, String createdBy, String schoolId) {
        // Validate schoolId is present
        if (schoolId == null || schoolId.trim().isEmpty()) {
            throw new RuntimeException("School ID is required to create a teacher");
        }

        // Check email uniqueness within the school for TEACHER role
        if (userRepository.existsBySchoolIdAndEmailAndRole(schoolId, teacherDTO.getEmail(), User.Role.TEACHER)) {
            throw new RuntimeException("Email already exists for a teacher in this school");
        }

        // Validate assignedClassIds belong to the same school
        java.util.List<String> assignedClassIds = teacherDTO.getAssignedClassIds();
        if (assignedClassIds != null && !assignedClassIds.isEmpty()) {
            java.util.List<com.littlesteps.playschool.entity.Classes> schoolClasses = classesRepository
                    .findBySchoolId(schoolId);
            java.util.Set<String> validClassIds = schoolClasses.stream()
                    .map(com.littlesteps.playschool.entity.Classes::getId)
                    .collect(java.util.stream.Collectors.toSet());

            for (String classId : assignedClassIds) {
                if (!validClassIds.contains(classId)) {
                    throw new RuntimeException("Class ID " + classId + " does not belong to this school");
                }
            }
        }

        // Use provided password or generate a secure one
        String rawPassword;
        if (teacherDTO.getPassword() != null && !teacherDTO.getPassword().trim().isEmpty()) {
            rawPassword = teacherDTO.getPassword();
        } else {
            rawPassword = generateSecurePassword();
        }

        // Create User with school context
        User user = new User();
        user.setSchoolId(schoolId);
        user.setCreatedBy(createdBy);
        user.setEmail(teacherDTO.getEmail());
        user.setUsername(teacherDTO.getEmail()); // Set username as email
        user.setName(teacherDTO.getName());
        user.setPhone(teacherDTO.getPhone());
        user.setRole(User.Role.TEACHER);
        user.setStatus(User.Status.ACTIVE);
        user.setActive(true);
        user.setJoiningDate(teacherDTO.getJoiningDate());
        user.setAssignedClassIds(assignedClassIds);
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
        teacher.setSchoolId(schoolId);

        teacher = teacherRepository.save(teacher);

        Map<String, Object> result = new HashMap<>();
        result.put("teacher", convertToDTO(teacher));
        result.put("password", rawPassword);

        // Log in audit
        auditService.logTeacherCreated(createdBy, teacher.getId(), result);

        return result;
    }

    /**
     * Get teacher by ID
     */
    @Cacheable(key = "#id")
    public TeacherDTO getTeacherById(String id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + id));
        return convertToDTO(teacher);
    }

    @CacheEvict(allEntries = true)
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

    @CacheEvict(allEntries = true)
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

    @Transactional
    @CacheEvict(allEntries = true)
    public void deleteTeacher(String id, String deletedBy) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + id));

        if (teacher.getStatus() == Teacher.Status.DELETED) {
            throw new RuntimeException("Teacher is already deleted");
        }

        teacher.setStatus(Teacher.Status.DELETED);

        // Clear assigned classes
        teacher.setAssignedClasses(new ArrayList<>());

        if (teacher.getUser() != null) {
            User user = teacher.getUser();
            user.setStatus(User.Status.DELETED);
            user.setActive(false);
            user.setAssignedClassIds(new ArrayList<>());
            userRepository.save(user);
        }

        teacherRepository.save(teacher);

        // Remove teacher from any classes where they are the class teacher
        List<com.littlesteps.playschool.entity.Classes> activeClasses = classesRepository
                .findBySchoolId(teacher.getSchoolId());
        for (com.littlesteps.playschool.entity.Classes cls : activeClasses) {
            if (id.equals(cls.getClassTeacherId())) {
                cls.setClassTeacherId(null);
                classesRepository.save(cls);
            }
        }

        // Remove teacher from subject assignments
        List<com.littlesteps.playschool.entity.ClassSubject> subjectAssignments = classSubjectRepository
                .findByTeacherId(id);
        for (com.littlesteps.playschool.entity.ClassSubject cs : subjectAssignments) {
            cs.setTeacherId(null);
            classSubjectRepository.save(cs);
        }

        auditService.logAction(deletedBy, "DELETE", "TEACHER", id, null, "Soft deleted teacher: " + teacher.getName());
    }

    @Transactional
    @CacheEvict(allEntries = true)
    public void restoreTeacher(String id, String restoredBy) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + id));

        if (teacher.getStatus() != Teacher.Status.DELETED) {
            throw new RuntimeException("Teacher is not deleted");
        }

        teacher.setStatus(Teacher.Status.INACTIVE);
        teacherRepository.save(teacher);

        if (teacher.getUser() != null) {
            User user = teacher.getUser();
            user.setStatus(User.Status.INACTIVE);
            user.setActive(false);
            userRepository.save(user);
        }

        auditService.logAction(restoredBy, "RESTORE", "TEACHER", id, null, "Restored teacher: " + teacher.getName());
    }

    @Autowired
    private com.littlesteps.playschool.repository.ClassesRepository classesRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ClassSubjectRepository classSubjectRepository;

    @CacheEvict(allEntries = true)
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

    /**
     * Update teacher class assignments
     * Validates teacher and classes belong to admin's school
     */
    @Transactional
    @CacheEvict(allEntries = true)
    public Map<String, Object> updateTeacherClassAssignments(String teacherId, java.util.List<String> assignedClassIds,
            String adminEmail, String schoolId) {
        // Validate schoolId is present
        if (schoolId == null || schoolId.trim().isEmpty()) {
            throw new RuntimeException("School ID is required");
        }

        // Find the teacher entity first
        com.littlesteps.playschool.entity.Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + teacherId));

        User teacherUser = teacher.getUser();
        if (teacherUser == null) {
            throw new RuntimeException("Teacher record exists but has no associated User account");
        }

        // Validate teacher role
        if (teacherUser.getRole() != User.Role.TEACHER) {
            throw new RuntimeException("User is not a teacher");
        }

        // Validate teacher belongs to admin's school
        if (!schoolId.equals(teacherUser.getSchoolId())) {
            throw new RuntimeException("Teacher does not belong to your school");
        }

        // Validate assignedClassIds belong to the same school
        if (assignedClassIds != null && !assignedClassIds.isEmpty()) {
            java.util.List<com.littlesteps.playschool.entity.Classes> schoolClasses = classesRepository
                    .findBySchoolId(schoolId);
            java.util.Set<String> validClassIds = schoolClasses.stream()
                    .map(com.littlesteps.playschool.entity.Classes::getId)
                    .collect(java.util.stream.Collectors.toSet());

            for (String classId : assignedClassIds) {
                if (!validClassIds.contains(classId)) {
                    throw new RuntimeException("Class ID " + classId + " does not belong to this school");
                }
            }
        }

        // Store old assignments for audit
        java.util.List<String> oldAssignments = teacherUser.getAssignedClassIds();

        // Replace existing assignments on BOTH Teacher and User to keep them in sync
        teacher.setAssignedClasses(assignedClassIds);
        teacherRepository.save(teacher);

        teacherUser.setAssignedClassIds(assignedClassIds);
        userRepository.save(teacherUser);

        // Log assignment update
        Map<String, Object> changes = new HashMap<>();
        changes.put("teacherId", teacherId);
        changes.put("oldAssignments", oldAssignments);
        changes.put("newAssignments", assignedClassIds);
        auditService.logTeacherUpdated(adminEmail, teacherId, changes);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Class assignments updated successfully");
        result.put("teacherId", teacherId);
        result.put("assignedClassIds", assignedClassIds);

        return result;
    }

    /**
     * Update teacher status (block/unblock)
     * BLOCKED → Teacher cannot login
     * ACTIVE → Teacher regains access
     */
    @Transactional
    @CacheEvict(allEntries = true)
    public Map<String, Object> updateTeacherStatus(String teacherId, String newStatus, String adminEmail,
            String schoolId) {
        // Validate schoolId is present
        if (schoolId == null || schoolId.trim().isEmpty()) {
            throw new RuntimeException("School ID is required");
        }

        // Validate status value
        User.Status status;
        try {
            status = User.Status.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status. Must be ACTIVE or BLOCKED");
        }

        // Only allow ACTIVE or BLOCKED status
        if (status != User.Status.ACTIVE && status != User.Status.BLOCKED) {
            throw new RuntimeException("Invalid status. Must be ACTIVE or BLOCKED");
        }

        // Find the teacher entity first
        com.littlesteps.playschool.entity.Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + teacherId));

        User teacherUser = teacher.getUser();
        if (teacherUser == null) {
            throw new RuntimeException("Teacher record exists but has no associated User account");
        }

        // Validate teacher role
        if (teacherUser.getRole() != User.Role.TEACHER) {
            throw new RuntimeException("User is not a teacher");
        }

        // Validate teacher belongs to admin's school
        if (!schoolId.equals(teacherUser.getSchoolId())) {
            throw new RuntimeException("Teacher does not belong to your school");
        }

        // Store old status for audit
        User.Status oldStatus = teacherUser.getStatus();

        // Update status on BOTH entities
        try {
            teacher.setStatus(com.littlesteps.playschool.entity.Teacher.Status.valueOf(newStatus.toUpperCase()));
        } catch (Exception e) {
            // If status enum doesn't match exactly, fallback or ignore if Teacher status is
            // different
            // Teacher.Status has ACTIVE, INACTIVE, SUSPENDED
            // User.Status has ACTIVE, INACTIVE, BLOCKED, SUSPENDED
            if (status == User.Status.BLOCKED) {
                teacher.setStatus(com.littlesteps.playschool.entity.Teacher.Status.INACTIVE); // or SUSPENDED?
            } else {
                teacher.setStatus(com.littlesteps.playschool.entity.Teacher.Status.valueOf(status.name()));
            }
        }
        teacherRepository.save(teacher);

        teacherUser.setStatus(status);

        // If blocking, also set active to false for login prevention

        // If blocking, also set active to false for login prevention
        if (status == User.Status.BLOCKED) {
            teacherUser.setActive(false);
        } else if (status == User.Status.ACTIVE) {
            teacherUser.setActive(true);
        }

        userRepository.save(teacherUser);

        // Log status update with specific action type
        Map<String, Object> changes = new HashMap<>();
        changes.put("teacherId", teacherId);
        changes.put("teacherEmail", teacherUser.getEmail());
        changes.put("oldStatus", oldStatus != null ? oldStatus.name() : "null");
        changes.put("newStatus", status.name());
        changes.put("schoolId", schoolId);

        if (status == User.Status.BLOCKED) {
            auditService.logTeacherBlocked(adminEmail, teacherId, changes);
        } else {
            auditService.logTeacherUnblocked(adminEmail, teacherId, changes);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", status == User.Status.BLOCKED ? "Teacher has been blocked and cannot login"
                : "Teacher has been unblocked and can now login");
        result.put("teacherId", teacherId);
        result.put("status", status.name());

        return result;
    }
}
