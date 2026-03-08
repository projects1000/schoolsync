package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.StudyMaterial;
import com.littlesteps.playschool.service.TeacherMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/teacher/study-materials")
@CrossOrigin(origins = "*")
public class TeacherMaterialController {

    @Autowired
    private TeacherMaterialService teacherMaterialService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<StudyMaterial> uploadMaterial(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("type") String type,
            @RequestParam("classId") String classId,
            @RequestParam("file") MultipartFile file) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        try {
            StudyMaterial material = teacherMaterialService.uploadMaterial(
                    email, title, description, type, classId, file);
            return ResponseEntity.ok(material);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload material: " + e.getMessage());
        }
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getMaterialsByClass(
            @PathVariable String classId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return ResponseEntity.ok(teacherMaterialService.getPaginatedMaterialsByClass(email, classId, pageable));
    }
}
