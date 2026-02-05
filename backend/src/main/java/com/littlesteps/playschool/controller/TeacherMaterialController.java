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

import java.util.List;

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
    public ResponseEntity<List<StudyMaterial>> getMaterialsByClass(@PathVariable String classId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherMaterialService.getMaterialsByClass(email, classId));
    }
}
