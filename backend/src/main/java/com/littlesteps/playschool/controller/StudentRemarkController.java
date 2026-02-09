package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.StudentRemark;
import com.littlesteps.playschool.service.StudentRemarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/remarks")
@CrossOrigin(origins = "*")
public class StudentRemarkController {

    @Autowired
    private StudentRemarkService studentRemarkService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> addRemark(@RequestBody Map<String, String> payload, Authentication authentication) {
        String studentId = payload.get("studentId");
        String title = payload.get("title");
        String description = payload.get("description");
        String typeStr = payload.get("type");
        StudentRemark.RemarkType type = StudentRemark.RemarkType.valueOf(typeStr);

        try {
            StudentRemark remark = studentRemarkService.addRemark(authentication.getName(), studentId, title,
                    description, type);
            return ResponseEntity.ok(remark);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid request");
        }
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> getRemarks(@PathVariable String studentId, Authentication authentication) {
        try {
            List<StudentRemark> remarks = studentRemarkService.getRemarks(authentication.getName(), studentId);
            return ResponseEntity.ok(remarks);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}
