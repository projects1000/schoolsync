package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.ClassDTO;
import com.littlesteps.playschool.entity.ClassSubject;
import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.security.SchoolContext;
import com.littlesteps.playschool.service.ClassService;
import com.littlesteps.playschool.service.ClassSubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/classes")
public class ClassController {

    @Autowired
    private ClassService classService;

    @Autowired
    private ClassSubjectService classSubjectService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<Classes>> getClasses() {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            // For SuperAdmin without a specific school context, return empty list or all
            // classes
            // Returning empty list prevents 400 Bad Request which breaks the UI
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        return ResponseEntity.ok(classService.getClassesBySchoolId(schoolId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
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

    @GetMapping("/{classId}/subjects")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<ClassSubject>> getSubjectsForClass(@PathVariable String classId) {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(classSubjectService.getSubjectsForClass(classId, schoolId));
    }

    @PostMapping("/{classId}/subjects")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> assignSubjectToClass(@PathVariable String classId,
            @RequestBody Map<String, Object> payload, Authentication authentication) {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().body("School context missing");
        }

        if (payload.containsKey("subjectIds")) {
            // Bulk assignment
            try {
                @SuppressWarnings("unchecked")
                List<String> subjectIds = (List<String>) payload.get("subjectIds");
                List<ClassSubject> assigned = classSubjectService.assignSubjectsToClass(classId, subjectIds, schoolId,
                        authentication.getName());
                return ResponseEntity.ok(assigned);
            } catch (ClassCastException e) {
                return ResponseEntity.badRequest().body("Invalid format for subjectIds");
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        } else {
            // Single assignment
            String subjectId = (String) payload.get("subjectId");
            String teacherId = (String) payload.get("teacherId");

            try {
                ClassSubject assigned = classSubjectService.assignSubjectToClass(classId, subjectId, teacherId,
                        schoolId, authentication.getName());
                return ResponseEntity.ok(assigned);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> updateClass(@PathVariable String id, @RequestBody ClassDTO classDTO,
            Authentication authentication) {
        try {
            Classes updatedClass = classService.updateClass(id, classDTO, authentication.getName());
            return ResponseEntity.ok(updatedClass);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @PostMapping("/{id}/assign-class-teacher")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> assignClassTeacher(@PathVariable String id,
            @RequestBody java.util.Map<String, String> payload, Authentication authentication) {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().body("School context missing");
        }
        String teacherId = payload.get("teacherId");
        try {
            Classes updatedClass = classService.assignClassTeacherToClass(id, teacherId, schoolId,
                    authentication.getName());
            return ResponseEntity.ok(updatedClass);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> deleteClass(@PathVariable String id, Authentication authentication) {
        try {
            classService.deleteClass(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
