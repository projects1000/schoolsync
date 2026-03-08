package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.ParentDTO;
import com.littlesteps.playschool.service.ParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/parents")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public class ParentController {

    @Autowired
    private ParentService parentService;

    @Autowired
    private com.littlesteps.playschool.repository.UserRepository userRepository;

    private String getSchoolId(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        com.littlesteps.playschool.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getSchoolId();
    }

    @GetMapping
    public ResponseEntity<?> getAllParents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            org.springframework.security.core.Authentication authentication) {
        String schoolId = getSchoolId(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(parentService.getAllParents(schoolId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParentDTO> getParentById(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            return ResponseEntity.ok(parentService.getParentById(id, schoolId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<List<com.littlesteps.playschool.dto.StudentDTO>> getParentChildren(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            return ResponseEntity.ok(parentService.getStudentsByParentId(id, schoolId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createParent(@RequestBody ParentDTO parentDTO,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            String createdBy = authentication.getName();
            Map<String, Object> result = parentService.createParentWithUser(parentDTO, createdBy, schoolId);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParentDTO> updateParent(@PathVariable String id, @RequestBody ParentDTO parentDTO,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            String updatedBy = authentication.getName();
            return ResponseEntity.ok(parentService.updateParent(id, parentDTO, updatedBy, schoolId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteParent(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            String deletedBy = authentication.getName();
            parentService.deleteParent(id, deletedBy, schoolId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Parent deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restoreParent(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            String restoredBy = authentication.getName();
            parentService.restoreParent(id, restoredBy, schoolId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Parent restored successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateParentStatus(@PathVariable String id, @RequestBody Map<String, String> payload,
            org.springframework.security.core.Authentication authentication) {
        try {
            String status = payload.get("status");
            String schoolId = getSchoolId(authentication);
            String updatedBy = authentication.getName();
            parentService.updateParentStatus(id, status, updatedBy, schoolId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/map-student")
    public ResponseEntity<?> mapStudentToParent(@RequestBody Map<String, String> request,
            org.springframework.security.core.Authentication authentication) {
        try {
            String parentId = request.get("parentId");
            String studentId = request.get("studentId");
            String schoolId = getSchoolId(authentication);
            String createdBy = authentication.getName();

            parentService.mapStudentToParent(parentId, studentId, createdBy, schoolId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/map-students")
    public ResponseEntity<?> mapStudentsToParent(@RequestBody Map<String, Object> request,
            org.springframework.security.core.Authentication authentication) {
        try {
            String parentId = (String) request.get("parentId");
            @SuppressWarnings("unchecked")
            List<String> studentIds = (List<String>) request.get("studentIds");
            String schoolId = getSchoolId(authentication);
            String createdBy = authentication.getName();

            parentService.mapStudentsToParent(parentId, studentIds, createdBy, schoolId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unmap-student")
    public ResponseEntity<?> unmapStudentFromParent(@RequestBody Map<String, String> request,
            org.springframework.security.core.Authentication authentication) {
        try {
            String parentId = request.get("parentId");
            String studentId = request.get("studentId");
            String schoolId = getSchoolId(authentication);
            String removedBy = authentication.getName();

            parentService.unmapStudentFromParent(parentId, studentId, removedBy, schoolId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/block")
    public ResponseEntity<?> blockParent(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            String blockedBy = authentication.getName();
            parentService.blockParent(id, blockedBy, schoolId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/unblock")
    public ResponseEntity<?> unblockParent(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            String unblockedBy = authentication.getName();
            parentService.unblockParent(id, unblockedBy, schoolId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String id,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            String resetBy = authentication.getName();
            Map<String, String> result = parentService.resetParentPassword(id, resetBy, schoolId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
