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

    @GetMapping
    public ResponseEntity<List<ParentDTO>> getAllParents() {
        return ResponseEntity.ok(parentService.getAllParents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParentDTO> getParentById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(parentService.getParentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ParentDTO> createParent(@RequestBody ParentDTO parentDTO) {
        try {
            ParentDTO created = parentService.createParent(parentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParentDTO> updateParent(@PathVariable String id, @RequestBody ParentDTO parentDTO) {
        try {
            return ResponseEntity.ok(parentService.updateParent(id, parentDTO));
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
