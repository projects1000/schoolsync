package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.ClassDTO;
import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.security.SchoolContext;
import com.littlesteps.playschool.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/classes")
public class ClassController {

    @Autowired
    private ClassService classService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Classes>> getClasses() {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(classService.getClassesBySchoolId(schoolId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createClass(@RequestBody ClassDTO classDTO, Authentication authentication) {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().body("School context missing");
        }
        try {
            Classes newClass = classService.createClass(classDTO, schoolId, authentication.getName());
            return ResponseEntity.ok(newClass);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateClass(@PathVariable String id, @RequestBody ClassDTO classDTO,
            Authentication authentication) {
        try {
            Classes updatedClass = classService.updateClass(id, classDTO, authentication.getName());
            return ResponseEntity.ok(updatedClass);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteClass(@PathVariable String id, Authentication authentication) {
        try {
            classService.deleteClass(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
