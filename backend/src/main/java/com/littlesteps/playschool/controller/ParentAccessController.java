package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.ParentDTO;
import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.service.ParentService;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.repository.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/parent")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasRole('PARENT')")
public class ParentAccessController {

    @Autowired
    private ParentService parentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParentRepository parentRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return parentRepository.findByUserId(user.getId())
                .map(parent -> {
                    // We can reuse the service converter logic if exposed, or simple response.
                    // Since service methods are school-scoped, we can use them if we know ID.
                    return ResponseEntity.ok(parentService.getParentById(parent.getId(), parent.getSchoolId()));
                })
                .orElseThrow(() -> new RuntimeException("Parent profile not confirmed for this user"));
    }

    @GetMapping("/children")
    public ResponseEntity<List<StudentDTO>> getMyChildren(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.littlesteps.playschool.entity.Parent parent = parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Parent profile not found"));

        return ResponseEntity.ok(parentService.getStudentsByParentId(parent.getId(), parent.getSchoolId()));
    }
}
