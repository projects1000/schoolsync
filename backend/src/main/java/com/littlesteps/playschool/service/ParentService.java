package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.ParentDTO;
import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.entity.Parent;
import com.littlesteps.playschool.entity.ParentStudentMap;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.ParentRepository;
import com.littlesteps.playschool.repository.ParentStudentMapRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
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

    private static final String ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

    /**
     * Get all parents for a school
     */
    public List<ParentDTO> getAllParents(String schoolId) {
        return parentRepository.findBySchoolId(schoolId)
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
     * Map a student to a parent using parent_student_map collection
     * Validates cross-school restrictions
     */
    @Transactional
    public void mapStudentToParent(String parentId, String studentId, String createdBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(parentId, schoolId)
                .orElseThrow(() -> new RuntimeException("Parent not found in this school"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Cross-school validation
        if (!schoolId.equals(student.getSchoolId())) {
            throw new RuntimeException("Cannot map parent to student from different school");
        }

        // Check if mapping already exists
        if (parentStudentMapRepository.existsByParentIdAndStudentId(parentId, studentId)) {
            throw new RuntimeException("Student is already mapped to this parent");
        }

        // Create mapping
        ParentStudentMap mapping = new ParentStudentMap(
                parentId,
                studentId,
                schoolId,
                parent.getRelation() != null ? parent.getRelation().name() : null,
                createdBy);

        parentStudentMapRepository.save(mapping);

        // Update student guardian info
        student.setGuardian(parent.getName());
        student.setGuardianPhone(parent.getPhoneNumber());
        student.setGuardianEmail(parent.getEmail());
        studentRepository.save(student);

        // Log in audit
        auditService.logParentStudentMapped(createdBy, parentId, studentId, schoolId);
    }

    /**
     * Unmap a student from a parent
     */
    @Transactional
    public void unmapStudentFromParent(String parentId, String studentId, String removedBy, String schoolId) {
        Parent parent = parentRepository.findByIdAndSchoolId(parentId, schoolId)
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
        return dto;
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
}
