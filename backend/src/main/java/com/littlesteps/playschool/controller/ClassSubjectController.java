package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.ClassSubject;
import com.littlesteps.playschool.security.SchoolContext;
import com.littlesteps.playschool.service.ClassSubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/class-subjects")
public class ClassSubjectController {

    @Autowired
    private ClassSubjectService classSubjectService;

    @PostMapping("/assign-teacher")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> assignTeacherToClassSubject(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().body("School context missing");
        }

        String classId = payload.get("classId");
        String subjectId = payload.get("subjectId");
        String teacherId = payload.get("teacherId");

        try {
            ClassSubject assigned = classSubjectService.assignTeacherToSubject(classId, subjectId, teacherId, schoolId,
                    authentication.getName());
            return ResponseEntity.ok(assigned);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> updateSubjectTeacher(@PathVariable String id, @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().body("School context missing");
        }
        String teacherId = payload.get("teacherId");

        try {
            ClassSubject updated = classSubjectService.updateSubjectTeacher(id, teacherId, schoolId,
                    authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> removeSubjectFromClass(@PathVariable String id, Authentication authentication) {
        String schoolId = SchoolContext.getSchoolId();
        if (schoolId == null) {
            return ResponseEntity.badRequest().body("School context missing");
        }

        try {
            classSubjectService.removeSubjectFromClass(id, schoolId, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
