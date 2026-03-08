package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.TeacherDTO;
import com.littlesteps.playschool.service.TeacherService;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.entity.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/admin/teachers")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:5173" })
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private UserRepository userRepository;

    private String getSchoolId(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getSchoolId();
    }

    /**
     * Get all teachers with optional filtering
     */
    @GetMapping
    public ResponseEntity<Page<TeacherDTO>> getAllTeachers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication.getName());
            Pageable pageable = PageRequest.of(page, size);
            Page<TeacherDTO> teachers = teacherService.getAllTeachers(schoolId, name, department, status, pageable);
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get teacher by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable String id) {
        try {
            TeacherDTO teacher = teacherService.getTeacherById(id);
            return ResponseEntity.ok(teacher);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create new teacher with user account
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTeacher(
            @Valid @RequestBody TeacherDTO teacherDTO,
            Authentication authentication) {
        try {
            String createdBy = authentication.getName();
            String schoolId = getSchoolId(createdBy);
            Map<String, Object> result = teacherService.createTeacherWithUser(teacherDTO, createdBy, schoolId);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Update existing teacher
     */
    @PutMapping("/{id}")
    public ResponseEntity<TeacherDTO> updateTeacher(
            @PathVariable String id,
            @Valid @RequestBody TeacherDTO teacherDTO,
            Authentication authentication) {
        try {
            TeacherDTO updatedTeacher = teacherService.updateTeacher(id, teacherDTO, authentication.getName());
            return ResponseEntity.ok(updatedTeacher);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTeacher(
            @PathVariable String id,
            Authentication authentication) {
        try {
            teacherService.deleteTeacher(id, authentication.getName());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Teacher deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Restore teacher
     */
    @PutMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restoreTeacher(
            @PathVariable String id,
            Authentication authentication) {
        try {
            teacherService.restoreTeacher(id, authentication.getName());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Teacher restored successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Assign classes to teacher (legacy - uses class names)
     */
    @PostMapping("/{id}/assign-classes")
    public ResponseEntity<Map<String, Object>> assignClasses(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            @SuppressWarnings("unchecked")
            List<String> classNames = (List<String>) request.get("classes");
            teacherService.assignClasses(id, classNames, authentication.getName());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Classes assigned successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Update teacher class assignments (uses class IDs with validation)
     * Validates teacher and classes belong to admin's school
     */
    @PutMapping("/{teacherId}/assign-classes")
    public ResponseEntity<Map<String, Object>> updateClassAssignments(
            @PathVariable String teacherId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            String schoolId = getSchoolId(adminEmail);

            @SuppressWarnings("unchecked")
            List<String> assignedClassIds = (List<String>) request.get("assignedClassIds");

            Map<String, Object> result = teacherService.updateTeacherClassAssignments(
                    teacherId, assignedClassIds, adminEmail, schoolId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Get teachers by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<Page<TeacherDTO>> getTeachersByDepartment(
            @PathVariable String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication.getName());
            Pageable pageable = PageRequest.of(page, size);
            Page<TeacherDTO> teachers = teacherService.getAllTeachers(schoolId, null, department, null, pageable);
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search teachers
     */
    @GetMapping("/search")
    public ResponseEntity<Page<TeacherDTO>> searchTeachers(
            @RequestParam String term,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication.getName());
            Pageable pageable = PageRequest.of(page, size);
            Page<TeacherDTO> teachers = teacherService.getAllTeachers(schoolId, term, null, null, pageable);
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Reset teacher password (admin only)
     */
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @PathVariable String id,
            Authentication authentication) {
        try {
            String newPassword = teacherService.resetTeacherPassword(id, authentication.getName());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password reset successfully",
                    "temporaryPassword", newPassword));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Send credentials to teacher email
     */
    @PostMapping("/{id}/send-credentials")
    public ResponseEntity<Map<String, Object>> sendCredentials(
            @PathVariable String id,
            Authentication authentication) {
        try {
            teacherService.sendTeacherCredentials(id, authentication.getName());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Credentials sent successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Update teacher status (block/unblock)
     * BLOCKED → Teacher cannot login
     * ACTIVE → Teacher regains access
     */
    @PatchMapping("/{teacherId}/status")
    public ResponseEntity<Map<String, Object>> updateTeacherStatus(
            @PathVariable String teacherId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            String schoolId = getSchoolId(adminEmail);
            String newStatus = (String) request.get("status");

            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Status is required"));
            }

            Map<String, Object> result = teacherService.updateTeacherStatus(
                    teacherId, newStatus, adminEmail, schoolId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }
}
