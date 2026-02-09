package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.Subject;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.service.SubjectService;
import com.littlesteps.playschool.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.getEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getAllSubjects(@RequestHeader("Authorization") String token) {
        try {
            User user = getAuthenticatedUser(token);
            List<Subject> subjects = subjectService.getAllSubjects(user.getSchoolId());
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createSubject(@RequestHeader("Authorization") String token, @RequestBody Subject subject) {
        try {
            User user = getAuthenticatedUser(token);
            // Verify Admin
            if (user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.SUPERADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            Subject created = subjectService.createSubject(user.getSchoolId(), subject);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubject(@RequestHeader("Authorization") String token, @PathVariable String id,
            @RequestBody Subject subject) {
        try {
            User user = getAuthenticatedUser(token);
            // Verify Admin
            if (user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.SUPERADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            Subject updated = subjectService.updateSubject(id, user.getSchoolId(), subject);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@RequestHeader("Authorization") String token, @PathVariable String id) {
        try {
            User user = getAuthenticatedUser(token);
            // Verify Admin
            if (user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.SUPERADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            subjectService.deleteSubject(id, user.getSchoolId());
            return ResponseEntity.ok(Map.of("message", "Subject deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
