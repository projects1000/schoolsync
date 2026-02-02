package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.ParentDTO;
import com.littlesteps.playschool.service.ParentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<ParentDTO>> getAllParents(
            org.springframework.security.core.Authentication authentication) {
        String schoolId = getSchoolId(authentication);
        return ResponseEntity.ok(parentService.getAllParents(schoolId));
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

    @PostMapping
    public ResponseEntity<ParentDTO> createParent(@RequestBody ParentDTO parentDTO,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            ParentDTO created = parentService.createParent(parentDTO, schoolId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParentDTO> updateParent(@PathVariable String id, @RequestBody ParentDTO parentDTO,
            org.springframework.security.core.Authentication authentication) {
        try {
            String schoolId = getSchoolId(authentication);
            return ResponseEntity.ok(parentService.updateParent(id, parentDTO, schoolId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/map-student")
    public ResponseEntity<Void> mapStudentToParent(@RequestBody Map<String, String> request) {
        try {
            String parentId = request.get("parentId");
            String studentId = request.get("studentId");
            parentService.mapStudentToParent(parentId, studentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/unmap-student")
    public ResponseEntity<Void> unmapStudentFromParent(@RequestBody Map<String, String> request) {
        try {
            String parentId = request.get("parentId");
            String studentId = request.get("studentId");
            parentService.unmapStudentFromParent(parentId, studentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
