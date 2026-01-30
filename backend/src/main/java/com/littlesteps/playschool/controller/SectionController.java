package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.Section;
import com.littlesteps.playschool.security.SchoolContext;
import com.littlesteps.playschool.service.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sections")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @GetMapping("/{classId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Section>> getSections(@PathVariable String classId) {
        return ResponseEntity.ok(sectionService.getSectionsByClass(classId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSection(@RequestBody Section section) {
        try {
            String schoolId = SchoolContext.getSchoolId();
            if (schoolId == null) {
                return ResponseEntity.badRequest().body("School ID not found in context");
            }
            section.setSchoolId(schoolId);

            Section createdSection = sectionService.createSection(section);
            return ResponseEntity.ok(createdSection);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating section: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSection(@PathVariable String id) {
        try {
            sectionService.deleteSection(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting section: " + e.getMessage());
        }
    }
}
