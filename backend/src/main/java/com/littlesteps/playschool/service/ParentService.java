package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.ParentDTO;
import com.littlesteps.playschool.dto.ParentAssignmentDTO;
import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.entity.Parent;
import com.littlesteps.playschool.entity.ParentStudentMap;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.ParentRepository;
import com.littlesteps.playschool.repository.ParentStudentMapRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ParentService {

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParentStudentMapRepository parentStudentMapRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private com.littlesteps.playschool.repository.MessageRepository messageRepository;

    @Autowired
    private com.littlesteps.playschool.repository.AssignmentRepository assignmentRepository;

    @Autowired
    private com.littlesteps.playschool.repository.CommunicationRepository communicationRepository;

    @Autowired
    private com.littlesteps.playschool.repository.StudyMaterialRepository studyMaterialRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ClassesRepository classesRepository;

    @Autowired
    private com.littlesteps.playschool.repository.TeacherRepository teacherRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ClassSubjectRepository classSubjectRepository;

    @Autowired
    private com.littlesteps.playschool.repository.SubjectRepository subjectRepository;

    private static final String ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

    /**
     * Get all parents for a school
     */
    public List<ParentDTO> getAllParents(String schoolId) {
        return parentRepository.findBySchoolIdAndStatusNot(schoolId, Parent.Status.DELETED)
                .stream()
                .map(parent -> convertToDTO(parent, schoolId))
                .collect(Collectors.toList());
    }

    /**
     * Get all deleted parents for a school
     */
    public List<ParentDTO> getDeletedParents(String schoolId) {
        return parentRepository.findBySchoolIdAndStatus(schoolId, Parent.Status.DELETED)
                .stream()
                .map(parent -> convertToDTO(parent, schoolId))
                .collect(Collectors.toList());
    }

    /**
     * Get parent by ID with school validation
     */
    public ParentDTO getParentById(String id, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        return convertToDTO(parent, schoolId);
    }

    /**
     * Create a new parent with associated user account
     * Following the TeacherService.createTeacherWithUser pattern
     */
    @Transactional
    public Map<String, Object> createParentWithUser(ParentDTO parentDTO, String createdBy, String schoolId) {
        // Validate schoolId is present
        if (schoolId == null || schoolId.trim().isEmpty()) {
            throw new RuntimeException("School ID is required to create a parent");
        }

        // Check email uniqueness within the school for PARENT role
        if (userRepository.existsBySchoolIdAndEmailAndRole(schoolId, parentDTO.getEmail(), User.Role.PARENT)) {
            throw new RuntimeException("Email already exists for a parent in this school");
        }

        // Use provided password or generate a secure one
        String rawPassword;
        if (parentDTO.getPassword() != null && !parentDTO.getPassword().trim().isEmpty()) {
            rawPassword = parentDTO.getPassword();
        } else {
            rawPassword = generateSecurePassword();
        }

        // Create User with school context and PARENT role
        User user = new User();
        user.setSchoolId(schoolId);
        user.setCreatedBy(createdBy);
        user.setEmail(parentDTO.getEmail());
        user.setUsername(parentDTO.getEmail()); // Set username as email
        user.setName(parentDTO.getName());
        user.setPhone(parentDTO.getPhoneNumber());
        user.setRole(User.Role.PARENT);
        user.setStatus(User.Status.ACTIVE);
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(rawPassword));

        user = userRepository.save(user);

        // Create Parent profile
        Parent parent = new Parent();
        parent.setUserId(user.getId());
        parent.setSchoolId(schoolId);
        parent.setCreatedBy(createdBy);
        parent.setName(parentDTO.getName());
        parent.setEmail(parentDTO.getEmail());
        parent.setPhoneNumber(parentDTO.getPhoneNumber());
        parent.setAddress(parentDTO.getAddress());
        parent.setOccupation(parentDTO.getOccupation());
        if (parentDTO.getRelation() != null) {
            try {
                parent.setRelation(Parent.RelationType.valueOf(parentDTO.getRelation().toUpperCase()));
            } catch (IllegalArgumentException e) {
                parent.setRelation(Parent.RelationType.GUARDIAN);
            }
        }
        parent.setEmergencyContactName(parentDTO.getEmergencyContactName());
        parent.setEmergencyContactPhone(parentDTO.getEmergencyContactPhone());
        parent.setEmergencyContactRelation(parentDTO.getEmergencyContactRelation());
        parent.setStatus(Parent.Status.ACTIVE);
        parent.setCreatedAt(LocalDateTime.now());

        parent = parentRepository.save(parent);

        Map<String, Object> result = new HashMap<>();
        result.put("parent", convertToDTO(parent, schoolId));
        result.put("password", rawPassword);
        result.put("userId", user.getId());

        // Log in audit
        auditService.logParentCreated(createdBy, parent.getId(), result);

        return result;
    }

    /**
     * Update parent profile
     */
    @Transactional
    public ParentDTO updateParent(String id, ParentDTO parentDTO, String updatedBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        parent.setName(parentDTO.getName());
        parent.setPhoneNumber(parentDTO.getPhoneNumber());
        parent.setAddress(parentDTO.getAddress());
        parent.setOccupation(parentDTO.getOccupation());
        if (parentDTO.getRelation() != null) {
            try {
                parent.setRelation(Parent.RelationType.valueOf(parentDTO.getRelation().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing relation if invalid
            }
        }
        parent.setEmergencyContactName(parentDTO.getEmergencyContactName());
        parent.setEmergencyContactPhone(parentDTO.getEmergencyContactPhone());
        parent.setEmergencyContactRelation(parentDTO.getEmergencyContactRelation());
        parent.setUpdatedAt(LocalDateTime.now());

        // Also update the linked User record
        if (parent.getUserId() != null) {
            userRepository.findById(parent.getUserId()).ifPresent(user -> {
                user.setName(parentDTO.getName());
                user.setPhone(parentDTO.getPhoneNumber());
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            });
        }

        Parent savedParent = parentRepository.save(parent);

        // Log in audit
        auditService.logParentUpdated(updatedBy, parent.getId());

        return convertToDTO(savedParent, schoolId);
    }

    /**
     * Delete parent (Soft delete)
     */
    @Transactional
    public void deleteParent(String id, String deletedBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        if (parent.getStatus() == Parent.Status.DELETED) {
            throw new RuntimeException("Parent is already deleted");
        }

        // 1. Soft Delete Parent
        parent.setStatus(Parent.Status.DELETED);
        parentRepository.save(parent);

        // 2. Soft Delete User Account
        if (parent.getUserId() != null) {
            userRepository.findById(parent.getUserId()).ifPresent(user -> {
                user.setStatus(User.Status.DELETED);
                user.setActive(false);
                userRepository.save(user);
            });
        }

        // Note: Not removing parentStudentMap here. Admin can restore later.
        // The mappings will just contain a deleted parent.

        auditService.logSchoolAction(deletedBy, "DELETE_PARENT", "PARENT", id, schoolId,
                null, "Soft deleted parent: " + parent.getName());
    }

    /**
     * Restore parent
     */
    @Transactional
    public void restoreParent(String id, String restoredBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        if (parent.getStatus() != Parent.Status.DELETED) {
            throw new RuntimeException("Parent is not deleted");
        }

        parent.setStatus(Parent.Status.INACTIVE);
        parentRepository.save(parent);

        if (parent.getUserId() != null) {
            userRepository.findById(parent.getUserId()).ifPresent(user -> {
                user.setStatus(User.Status.INACTIVE);
                user.setActive(false);
                userRepository.save(user);
            });
        }

        auditService.logSchoolAction(restoredBy, "RESTORE_PARENT", "PARENT", id, schoolId,
                null, "Restored parent: " + parent.getName());
    }

    /**
     * Map a student to a parent using parent_student_map collection
     * Validates cross-school restrictions
     */
    @Transactional
    public void mapStudentToParent(String parentId, String studentId, String createdBy, String schoolId) {
        mapStudentsToParent(parentId, List.of(studentId), createdBy, schoolId);
    }

    /**
     * Map multiple students to a parent using parent_student_map collection
     * Validates cross-school restrictions for all students
     */
    @Transactional
    public void mapStudentsToParent(String parentId, List<String> studentIds, String createdBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(parentId, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found in this school"));

        List<Student> students = studentRepository.findAllById(studentIds);

        if (students.size() != studentIds.size()) {
            throw new RuntimeException("One or more students not found");
        }

        for (Student student : students) {
            // Cross-school validation
            if (!schoolId.equals(student.getSchoolId())) {
                throw new RuntimeException("Student " + student.getName() + " does not belong to this school");
            }

            // Check if mapping already exists
            if (parentStudentMapRepository.existsByParentIdAndStudentId(parentId, student.getId())) {
                continue; // Skip if already mapped
            }

            // Create mapping
            ParentStudentMap mapping = new ParentStudentMap(
                    parentId,
                    student.getId(),
                    schoolId,
                    parent.getRelation() != null ? parent.getRelation().name() : null,
                    createdBy);

            parentStudentMapRepository.save(mapping);

            // Update student guardian info
            student.setGuardian(parent.getName());
            student.setGuardianPhone(parent.getPhoneNumber());
            student.setGuardianEmail(parent.getEmail());
            studentRepository.save(student);

            // Log in audit (individual log for granularity, or one bulk log? Request says
            // "Log mapping action".
            // Existing audit service is granular. Let's log per student for now as it's
            // safer for audit trails)
            auditService.logParentStudentMapped(createdBy, parentId, student.getId(), schoolId);
        }
    }

    /**
     * Unmap a student from a parent
     */
    @Transactional
    public void unmapStudentFromParent(String parentId, String studentId, String removedBy, String schoolId) {
        parentRepository.findByIdAndSchoolId(parentId, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found in this school"));

        // Verify mapping exists
        if (!parentStudentMapRepository.existsByParentIdAndStudentId(parentId, studentId)) {
            throw new RuntimeException("Student is not mapped to this parent");
        }

        parentStudentMapRepository.deleteByParentIdAndStudentId(parentId, studentId);

        // Check if student has other parents, if not clear guardian info
        long otherParentsCount = parentStudentMapRepository.countByStudentId(studentId);
        if (otherParentsCount == 0) {
            studentRepository.findById(studentId).ifPresent(student -> {
                student.setGuardian(null);
                student.setGuardianPhone(null);
                student.setGuardianEmail(null);
                studentRepository.save(student);
            });
        }

        // Log in audit
        auditService.logParentStudentUnmapped(removedBy, parentId, studentId, schoolId);
    }

    /**
     * Get all students mapped to a parent
     */
    public List<StudentDTO> getStudentsByParentId(String parentId, String schoolId) {
        // Validate parent belongs to school
        parentRepository.findByIdAndSchoolId(parentId, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found in this school"));

        List<ParentStudentMap> mappings = parentStudentMapRepository.findByParentIdAndSchoolId(parentId, schoolId);

        return mappings.stream()
                .map(mapping -> studentRepository.findById(mapping.getStudentId()).orElse(null))
                .filter(student -> student != null)
                .map(this::convertStudentToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all parents mapped to a student
     */
    public List<ParentDTO> getParentsByStudentId(String studentId, String schoolId) {
        // Validate student belongs to school
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!schoolId.equals(student.getSchoolId())) {
            throw new RuntimeException("Student does not belong to this school");
        }

        List<ParentStudentMap> mappings = parentStudentMapRepository.findByStudentIdAndSchoolId(studentId, schoolId);

        return mappings.stream()
                .map(mapping -> parentRepository.findById(mapping.getParentId()).orElse(null))
                .filter(parent -> parent != null)
                .map(parent -> convertToDTO(parent, schoolId))
                .collect(Collectors.toList());
    }

    /**
     * Block a parent (disables login)
     */
    @Transactional
    public void blockParent(String parentId, String blockedBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(parentId, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found in this school"));

        parent.setStatus(Parent.Status.SUSPENDED);
        parent.setUpdatedAt(LocalDateTime.now());
        parentRepository.save(parent);

        // Also block the user account
        if (parent.getUserId() != null) {
            userRepository.findById(parent.getUserId()).ifPresent(user -> {
                user.setStatus(User.Status.BLOCKED);
                user.setActive(false);
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            });
        }

        auditService.logParentBlocked(blockedBy, parentId, schoolId);
    }

    /**
     * Unblock a parent (enables login)
     */
    @Transactional
    public void unblockParent(String parentId, String unblockedBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(parentId, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found in this school"));

        parent.setStatus(Parent.Status.ACTIVE);
        parent.setUpdatedAt(LocalDateTime.now());
        parentRepository.save(parent);

        // Also unblock the user account
        if (parent.getUserId() != null) {
            userRepository.findById(parent.getUserId()).ifPresent(user -> {
                user.setStatus(User.Status.ACTIVE);
                user.setActive(true);
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            });
        }

        auditService.logParentUnblocked(unblockedBy, parentId, schoolId);
    }

    /**
     * Update parent status (Generic method)
     */
    @Transactional
    public void updateParentStatus(String parentId, String statusStr, String updatedBy, String schoolId) {
        if ("BLOCKED".equalsIgnoreCase(statusStr)) {
            blockParent(parentId, updatedBy, schoolId);
            return;
        }

        Parent.Status status;
        try {
            status = Parent.Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusStr);
        }

        if (status == Parent.Status.ACTIVE) {
            unblockParent(parentId, updatedBy, schoolId);
        } else if (status == Parent.Status.SUSPENDED) {
            blockParent(parentId, updatedBy, schoolId);
        } else {
            // Handle other statuses if necessary, e.g., INACTIVE
            // For now, let's just update the parent entity status for others without side
            // effects
            Parent parent = parentRepository.findByIdAndSchoolId(parentId, schoolId)
                    .orElseThrow(() -> new RuntimeException("Parent not found in this school"));
            parent.setStatus(status);
            parentRepository.save(parent);
            auditService.logSchoolAction(updatedBy, "UPDATE_PARENT_STATUS", "PARENT", parentId, schoolId,
                    Map.of("status", status), "Updated parent status to " + status);
        }
    }

    /**
     * Reset parent password
     */
    @Transactional
    public Map<String, String> resetParentPassword(String parentId, String resetBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(parentId, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found in this school"));

        if (parent.getUserId() == null) {
            throw new RuntimeException("Parent has no associated user account");
        }

        User user = userRepository.findById(parent.getUserId())
                .orElseThrow(() -> new RuntimeException("User account not found"));

        String newPassword = generateSecurePassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.logParentPasswordReset(resetBy, parentId, schoolId);

        Map<String, String> result = new HashMap<>();
        result.put("newPassword", newPassword);
        result.put("email", parent.getEmail());
        return result;
    }

    /**
     * Generate secure password
     */
    private String generateSecurePassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            password.append(ALLOWED_CHARS.charAt(random.nextInt(ALLOWED_CHARS.length())));
        }
        return password.toString();
    }

    /**
     * Convert Parent entity to DTO
     */
    private ParentDTO convertToDTO(Parent parent, String schoolId) {
        ParentDTO dto = new ParentDTO();
        dto.setId(parent.getId());
        dto.setName(parent.getName());
        dto.setEmail(parent.getEmail());
        dto.setPhoneNumber(parent.getPhoneNumber());
        dto.setAddress(parent.getAddress());
        dto.setOccupation(parent.getOccupation());
        dto.setRelation(parent.getRelation() != null ? parent.getRelation().name() : null);
        dto.setEmergencyContactName(parent.getEmergencyContactName());
        dto.setEmergencyContactPhone(parent.getEmergencyContactPhone());
        dto.setEmergencyContactRelation(parent.getEmergencyContactRelation());
        dto.setStatus(parent.getStatus() != null ? parent.getStatus().name() : null);

        // Get children count from mapping collection
        long childrenCount = parentStudentMapRepository.countByParentId(parent.getId());
        dto.setChildrenCount((int) childrenCount);

        return dto;
    }

    /**
     * Convert Student entity to DTO
     */
    private StudentDTO convertStudentToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setAdmissionNo(student.getAdmissionNo());
        dto.setRollNo(student.getRollNo());
        dto.setName(student.getName());
        dto.setAge(student.getAge());
        dto.setClassName(student.getClassName());
        dto.setClassId(student.getClassId());
        dto.setSectionId(student.getSectionId());
        dto.setGuardian(student.getGuardian());
        dto.setGuardianPhone(student.getGuardianPhone());
        dto.setGuardianEmail(student.getGuardianEmail());
        dto.setAddress(student.getAddress());
        dto.setStatus(student.getStatus() != null ? student.getStatus().name() : null);
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setGender(student.getGender());
        dto.setBloodGroup(student.getBloodGroup());
        dto.setNewToEducation(student.getNewToEducation());
        dto.setPreviousSchool(student.getPreviousSchool());
        dto.setPreviousClass(student.getPreviousClass());
        dto.setPreviousPercentage(student.getPreviousPercentage());
        dto.setMedicalConditions(student.getMedicalConditions());
        dto.setTransportMode(student.getTransportMode());
        dto.setProfileCompleted(student.getProfileCompleted());
        return dto;
    }

    /**
     * Get student attendance records
     */
    public List<?> getStudentAttendance(String studentId, String startDate, String endDate) {
        if (startDate != null && endDate != null) {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            return attendanceService.getStudentAttendanceByDateRange(studentId, start, end);
        }
        return attendanceService.getStudentAttendance(studentId);
    }

    /**
     * Get messages for a parent (broadcast + individual messages)
     */
    public List<com.littlesteps.playschool.entity.Message> getChildMessages(String studentId, String classId) {
        java.util.Map<String, com.littlesteps.playschool.entity.Message> messageMap = new java.util.LinkedHashMap<>();

        if (classId != null) {
            // Get broadcast messages for this specific class
            List<com.littlesteps.playschool.entity.Message> classBroadcasts = messageRepository
                    .findByClassIdAndRecipientId(classId, "ALL");
            for (com.littlesteps.playschool.entity.Message msg : classBroadcasts) {
                messageMap.put(msg.getId(), msg);
            }
        }

        // Get individual messages for this specific student
        List<com.littlesteps.playschool.entity.Message> individualMessages = messageRepository
                .findByRecipientId(studentId);
        for (com.littlesteps.playschool.entity.Message msg : individualMessages) {
            messageMap.put(msg.getId(), msg);
        }

        java.util.List<com.littlesteps.playschool.entity.Communication> communications = new java.util.ArrayList<>();
        if (classId != null) {
            java.util.List<com.littlesteps.playschool.entity.Communication> classComms = communicationRepository
                    .findByTargetClassIdAndRecipientType(classId,
                            com.littlesteps.playschool.entity.Communication.RecipientType.CLASS_PARENTS);
            communications.addAll(classComms);

            // Get student to find schoolId
            com.littlesteps.playschool.entity.Student student = studentRepository.findById(studentId).orElse(null);
            if (student != null && student.getSchoolId() != null) {
                java.util.List<com.littlesteps.playschool.entity.Communication> allParentBroadcasts = communicationRepository
                        .findBySchoolIdAndRecipientType(
                                student.getSchoolId(),
                                com.littlesteps.playschool.entity.Communication.RecipientType.ALL_PARENTS);
                if (allParentBroadcasts != null) {
                    communications.addAll(allParentBroadcasts);
                }
            }
        }

        // Find parent IDs for the student
        java.util.List<com.littlesteps.playschool.entity.ParentStudentMap> parentMaps = parentStudentMapRepository
                .findByStudentId(studentId);

        java.util.List<com.littlesteps.playschool.entity.Communication> parentComms = new java.util.ArrayList<>();
        for (com.littlesteps.playschool.entity.ParentStudentMap map : parentMaps) {
            com.littlesteps.playschool.entity.Parent parentEntity = parentRepository.findById(map.getParentId())
                    .orElse(null);
            if (parentEntity != null && parentEntity.getUserId() != null) {
                java.util.List<com.littlesteps.playschool.entity.Communication> comms = communicationRepository
                        .findByRecipientIdsContaining(parentEntity.getUserId());
                parentComms.addAll(comms);
            }
        }
        java.util.List<com.littlesteps.playschool.entity.Communication> filteredParentComms = new java.util.ArrayList<>();
        for (com.littlesteps.playschool.entity.Communication comm : parentComms) {
            if (comm.getTargetStudentId() == null || comm.getTargetStudentId().equals(studentId)) {
                filteredParentComms.add(comm);
            }
        }
        communications.addAll(filteredParentComms);

        for (com.littlesteps.playschool.entity.Communication comm : communications) {
            com.littlesteps.playschool.entity.Message adaptedMsg = new com.littlesteps.playschool.entity.Message();
            adaptedMsg.setId(comm.getId());
            adaptedMsg.setSubject(comm.getSubject());
            adaptedMsg.setContent(comm.getBody());
            adaptedMsg.setCreatedAt(comm.getCreatedAt());
            adaptedMsg.setSenderId(comm.getSenderId());
            adaptedMsg.setSenderName(comm.getSenderName() + " (Admin)");
            messageMap.put(comm.getId(), adaptedMsg);
        }

        // Sort by date (newest first) and return
        return messageMap.values().stream()
                .sorted((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<com.littlesteps.playschool.entity.Message> getParentMessages(String parentId,
            List<StudentDTO> children) {
        // Use a Set with message ID for deduplication
        java.util.Map<String, com.littlesteps.playschool.entity.Message> messageMap = new java.util.LinkedHashMap<>();

        // For each child, get messages specific to their class and individually
        for (StudentDTO child : children) {
            String studentId = child.getId();
            String classId = child.getClassId();

            if (classId != null) {
                // Get broadcast messages for this specific class
                List<com.littlesteps.playschool.entity.Message> classBroadcasts = messageRepository
                        .findByClassIdAndRecipientId(classId, "ALL");
                for (com.littlesteps.playschool.entity.Message msg : classBroadcasts) {
                    messageMap.put(msg.getId(), msg);
                }
            }

            // Get individual messages for this specific student
            List<com.littlesteps.playschool.entity.Message> individualMessages = messageRepository
                    .findByRecipientId(studentId);
            for (com.littlesteps.playschool.entity.Message msg : individualMessages) {
                messageMap.put(msg.getId(), msg);
            }

            // FETCH FROM ADMIN COMMUNICATIONS
            java.util.List<com.littlesteps.playschool.entity.Communication> communications = new java.util.ArrayList<>();
            if (classId != null) {
                java.util.List<com.littlesteps.playschool.entity.Communication> classComms = communicationRepository
                        .findByTargetClassIdAndRecipientType(classId,
                                com.littlesteps.playschool.entity.Communication.RecipientType.CLASS_PARENTS);
                communications.addAll(classComms);

                // Fetch ALL_PARENTS broadcasts
                java.util.List<com.littlesteps.playschool.entity.Communication> allParentBroadcasts = new java.util.ArrayList<>();
                com.littlesteps.playschool.entity.Student student = studentRepository.findById(studentId).orElse(null);
                if (student != null && student.getSchoolId() != null) {
                    allParentBroadcasts = communicationRepository.findBySchoolIdAndRecipientType(
                            student.getSchoolId(),
                            com.littlesteps.playschool.entity.Communication.RecipientType.ALL_PARENTS);
                }
                if (allParentBroadcasts != null) {
                    communications.addAll(allParentBroadcasts);
                }
            }
            // Fetch direct messages targeting this child via parent
            com.littlesteps.playschool.entity.Parent parentEntity = parentRepository.findById(parentId).orElse(null);
            String userIdForComms = parentEntity != null ? parentEntity.getUserId() : parentId;
            java.util.List<com.littlesteps.playschool.entity.Communication> parentComms = communicationRepository
                    .findByRecipientIdsContaining(userIdForComms); // In admin ctrl we pass user ID

            // Filter by targetStudentId so messages directed to one child dont show up for
            // the other
            java.util.List<com.littlesteps.playschool.entity.Communication> filteredParentComms = new java.util.ArrayList<>();
            for (com.littlesteps.playschool.entity.Communication comm : parentComms) {
                if (comm.getTargetStudentId() == null || comm.getTargetStudentId().equals(studentId)) {
                    filteredParentComms.add(comm);
                }
            }
            communications.addAll(filteredParentComms);

            for (com.littlesteps.playschool.entity.Communication comm : communications) {
                com.littlesteps.playschool.entity.Message adaptedMsg = new com.littlesteps.playschool.entity.Message();
                adaptedMsg.setId(comm.getId());
                adaptedMsg.setSubject(comm.getSubject());
                adaptedMsg.setContent(comm.getBody());
                adaptedMsg.setCreatedAt(comm.getCreatedAt());
                adaptedMsg.setSenderId(comm.getSenderId());
                adaptedMsg.setSenderName(comm.getSenderName() + " (Admin)");
                messageMap.put(comm.getId(), adaptedMsg);
            }
        }

        // Sort by date (newest first) and return
        return messageMap.values().stream()
                .sorted((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get assignments for a student's class
     */
    public List<com.littlesteps.playschool.dto.ParentAssignmentDTO> getStudentAssignments(String studentId) {
        // Get student to find their classId
        com.littlesteps.playschool.entity.Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Fetch assignments for the student's class
        List<com.littlesteps.playschool.entity.Assignment> assignments = assignmentRepository
                .findByClassId(student.getClassId());

        // Sort by due date (nearest first)
        return assignments.stream()
                .sorted((a1, a2) -> a1.getDueDate().compareTo(a2.getDueDate()))
                .map(assignment -> {
                    String teacherName = "Unknown Teacher";
                    if (assignment.getTeacherId() != null) {
                        teacherName = teacherRepository.findById(assignment.getTeacherId())
                                .map(com.littlesteps.playschool.entity.Teacher::getName)
                                .orElse("Unknown Teacher");
                    }

                    return new com.littlesteps.playschool.dto.ParentAssignmentDTO(
                            assignment.getId(),
                            assignment.getTitle(),
                            assignment.getDescription(),
                            assignment.getDueDate(),
                            assignment.getAttachmentUrl(),
                            teacherName);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get study materials for a student's class
     */
    public List<com.littlesteps.playschool.entity.StudyMaterial> getStudentStudyMaterials(String studentId) {
        // Get student to find their classId
        com.littlesteps.playschool.entity.Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Fetch study materials for the student's class
        List<com.littlesteps.playschool.entity.StudyMaterial> materials = studyMaterialRepository
                .findByClassId(student.getClassId());

        // Sort by created date (newest first)
        return materials.stream()
                .sorted((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()))
                .collect(java.util.stream.Collectors.toList());
    }

    // Legacy method for backward compatibility
    @Deprecated
    public ParentDTO createParent(ParentDTO parentDTO, String schoolId) {
        Map<String, Object> result = createParentWithUser(parentDTO, null, schoolId);
        return (ParentDTO) result.get("parent");
    }

    // Legacy method for backward compatibility
    @Deprecated
    public ParentDTO updateParent(String id, ParentDTO parentDTO, String schoolId) {
        return updateParent(id, parentDTO, null, schoolId);
    }

    // Get academic info for all children of a parent
    public java.util.List<com.littlesteps.playschool.dto.ParentAcademicInfoDTO> getAcademicInfoForChildren(
            String parentId, String schoolId) {

        java.util.List<com.littlesteps.playschool.dto.ParentAcademicInfoDTO> result = new java.util.ArrayList<>();

        // Get all students for this parent
        java.util.List<StudentDTO> children = getStudentsByParentId(parentId, schoolId);

        for (StudentDTO child : children) {
            com.littlesteps.playschool.dto.ParentAcademicInfoDTO info = new com.littlesteps.playschool.dto.ParentAcademicInfoDTO();
            info.setChildId(child.getId());
            info.setChildName(child.getName());

            // Get class details
            if (child.getClassId() != null) {
                classesRepository.findById(child.getClassId()).ifPresent(cls -> {
                    info.setClassName(cls.getName());
                    info.setSection(cls.getSection());

                    // Get class teacher name
                    if (cls.getClassTeacherId() != null) {
                        teacherRepository.findById(cls.getClassTeacherId()).ifPresent(teacher -> {
                            info.setClassTeacherName(teacher.getName());
                        });
                    }
                });
            }

            // Get subjects and their teachers for this class
            java.util.List<com.littlesteps.playschool.dto.ParentAcademicInfoDTO.SubjectTeacherInfo> subjects = new java.util.ArrayList<>();
            if (child.getClassId() != null) {
                java.util.List<com.littlesteps.playschool.entity.ClassSubject> classSubjects = classSubjectRepository
                        .findByClassId(child.getClassId());

                for (com.littlesteps.playschool.entity.ClassSubject cs : classSubjects) {
                    String subjectName = "Unknown";
                    String teacherName = "Not Assigned";

                    java.util.Optional<com.littlesteps.playschool.entity.Subject> subjectOpt = subjectRepository
                            .findById(cs.getSubjectId());
                    if (subjectOpt.isPresent()) {
                        subjectName = subjectOpt.get().getName();
                    }

                    if (cs.getTeacherId() != null) {
                        java.util.Optional<com.littlesteps.playschool.entity.Teacher> teacherOpt = teacherRepository
                                .findById(cs.getTeacherId());
                        if (teacherOpt.isPresent()) {
                            teacherName = teacherOpt.get().getName();
                        }
                    }

                    subjects.add(new com.littlesteps.playschool.dto.ParentAcademicInfoDTO.SubjectTeacherInfo(
                            cs.getSubjectId(), subjectName, cs.getTeacherId(), teacherName));
                }
            }
            info.setSubjects(subjects);

            result.add(info);
        }

        return result;
    }
}
