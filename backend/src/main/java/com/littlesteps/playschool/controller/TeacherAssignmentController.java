package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.Assignment;
import com.littlesteps.playschool.service.TeacherAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/teacher/assignments")
@CrossOrigin(origins = "*")
public class TeacherAssignmentController {

    @Autowired
    private TeacherAssignmentService teacherAssignmentService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Assignment> createAssignment(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("dueDate") String dueDate,
            @RequestParam("classId") String classId,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            Assignment assignment = teacherAssignmentService.createAssignment(
                    email, title, description, LocalDate.parse(dueDate), classId, file);
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create assignment: " + e.getMessage());
        }
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getAssignmentsByClass(
            @PathVariable String classId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size, Sort.by("dueDate").descending());
        return ResponseEntity.ok(teacherAssignmentService.getPaginatedAssignmentsByClass(email, classId, pageable));
    }
}
