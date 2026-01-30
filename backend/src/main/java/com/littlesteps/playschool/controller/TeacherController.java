package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.TeacherDTO;
import com.littlesteps.playschool.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/teachers")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:5173" })
@PreAuthorize("hasRole('ADMIN')")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    /**
     * Get all teachers with optional filtering
     */
    @GetMapping
    public ResponseEntity<List<TeacherDTO>> getAllTeachers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status) {
        try {
            List<TeacherDTO> teachers = teacherService.getAllTeachers(name, department, status);
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
            Map<String, Object> result = teacherService.createTeacherWithUser(teacherDTO, createdBy);
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

    /**
     * Delete (deactivate) teacher
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTeacher(
            @PathVariable String id,
            Authentication authentication) {
        try {
            teacherService.deactivateTeacher(id, authentication.getName());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Teacher deactivated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    /**
     * Assign classes to teacher
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
     * Get teachers by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<List<TeacherDTO>> getTeachersByDepartment(@PathVariable String department) {
        try {
            List<TeacherDTO> teachers = teacherService.getAllTeachers(null, department, null);
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search teachers
     */
    @GetMapping("/search")
    public ResponseEntity<List<TeacherDTO>> searchTeachers(@RequestParam String term) {
        try {
            List<TeacherDTO> teachers = teacherService.getAllTeachers(term, null, null);
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
}