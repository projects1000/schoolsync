package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.Communication;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.SchoolRepository;
import com.littlesteps.playschool.service.SuperAdminCommunicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin/communications")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminCommunicationController {

    @Autowired
    private SuperAdminCommunicationService superAdminCommunicationService;

    @Autowired
    private SchoolRepository schoolRepository;

    @PostMapping("/direct")
    public ResponseEntity<Communication> sendDirectMessage(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(superAdminCommunicationService.sendDirectMessage(email, payload));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Communication> sendBroadcast(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(superAdminCommunicationService.sendBroadcast(email, payload));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Communication>> getHistory(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(superAdminCommunicationService.getHistory(email));
    }

    @GetMapping("/admins")
    public ResponseEntity<List<Map<String, String>>> getAdmins() {
        List<User> admins = superAdminCommunicationService.getAllAdmins();

        // Build a school ID → school name lookup map
        Map<String, String> schoolNameMap = new HashMap<>();
        schoolRepository.findAll().forEach(school ->
                schoolNameMap.put(school.getId(), school.getName())
        );

        List<Map<String, String>> adminList = admins.stream()
                .filter(a -> a.getStatus() != User.Status.DELETED)
                .map(a -> {
                    Map<String, String> item = new HashMap<>();
                    item.put("id", a.getId());
                    item.put("name", a.getName() != null ? a.getName() : "Unnamed Admin");
                    item.put("email", a.getEmail() != null ? a.getEmail() : "");
                    item.put("schoolId", a.getSchoolId() != null ? a.getSchoolId() : "");
                    item.put("schoolName", a.getSchoolId() != null
                            ? schoolNameMap.getOrDefault(a.getSchoolId(), "Unknown School")
                            : "No School Assigned");
                    item.put("status", a.getStatus() != null ? a.getStatus().name() : "ACTIVE");
                    return item;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(adminList);
    }
}

