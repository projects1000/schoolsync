package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.AdminResponse;
import com.littlesteps.playschool.dto.CreateAdminRequest;
import com.littlesteps.playschool.dto.CreateSchoolRequest;
import com.littlesteps.playschool.dto.SchoolResponse;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.service.SuperAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminController {

    @Autowired
    private SuperAdminService superAdminService;

    @GetMapping("/schools")
    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        List<SchoolResponse> schools = superAdminService.getAllSchools();
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/admins")
    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        List<AdminResponse> admins = superAdminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<com.littlesteps.playschool.dto.DashboardStats> getDashboardData() {
        com.littlesteps.playschool.dto.DashboardStats stats = superAdminService.getDashboardData();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/admins")
    public ResponseEntity<User> createAdmin(@RequestBody @Valid CreateAdminRequest request,
            @AuthenticationPrincipal String createdBy) {
        User admin = superAdminService.createAdmin(request, createdBy);
        return ResponseEntity.ok(admin);
    }

    @PostMapping("/schools")
    public ResponseEntity<School> createSchool(@RequestBody CreateSchoolRequest request) {
        School school = superAdminService.createSchool(request);
        return ResponseEntity.ok(school);
    }

    @PostMapping("/schools/{schoolId}/admin")
    public ResponseEntity<User> createAdminForSchool(
            @PathVariable String schoolId,
            @RequestBody CreateAdminRequest request,
            @AuthenticationPrincipal String createdBy) {
        User admin = superAdminService.createAdminForSchool(schoolId, request, createdBy);
        return ResponseEntity.ok(admin);
    }

    @PutMapping("/schools/{schoolId}")
    public ResponseEntity<School> updateSchool(@PathVariable String schoolId, @RequestBody School schoolData) {
        School updatedSchool = superAdminService.updateSchool(schoolId, schoolData);
        return ResponseEntity.ok(updatedSchool);
    }

    @DeleteMapping("/schools/{schoolId}")
    public ResponseEntity<Void> deleteSchool(@PathVariable String schoolId) {
        superAdminService.deleteSchool(schoolId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/schools/{schoolId}/assign-admin/{adminId}")
    public ResponseEntity<Void> assignAdminToSchool(@PathVariable String schoolId, @PathVariable String adminId) {
        superAdminService.assignAdminToSchool(schoolId, adminId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/admins/{adminId}/status")
    public ResponseEntity<Void> updateAdminStatus(
            @PathVariable String adminId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal String performedBy) {
        String status = request.get("status");
        if (status == null || status.isEmpty()) {
            throw new IllegalArgumentException("status is required");
        }
        superAdminService.updateAdminStatus(adminId, status, performedBy);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admins/{adminId}/reset-password")
    public ResponseEntity<Void> resetAdminPassword(
            @PathVariable String adminId,
            @AuthenticationPrincipal String performedBy) {
        superAdminService.resetAdminPassword(adminId, performedBy);
        return ResponseEntity.ok().build();
    }
}
