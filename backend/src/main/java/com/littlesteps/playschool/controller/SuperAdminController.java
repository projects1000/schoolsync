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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/superadmin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(SuperAdminController.class);

    @Autowired
    private SuperAdminService superAdminService;

    @GetMapping("/schools")
    public ResponseEntity<Page<SchoolResponse>> getAllSchools(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            logger.info("Fetching schools (page: {}, size: {})...", page, size);
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<SchoolResponse> schools = superAdminService.getAllSchools(pageable);
            logger.info("Successfully fetched {} schools", schools.getNumberOfElements());
            return ResponseEntity.ok(schools);
        } catch (Exception e) {
            logger.error("Error fetching schools: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/schools/trash")
    public ResponseEntity<List<SchoolResponse>> getDeletedSchools() {
        try {
            logger.info("Fetching deleted schools (trash)...");
            List<SchoolResponse> schools = superAdminService.getDeletedSchools();
            logger.info("Successfully fetched {} deleted schools", schools.size());
            return ResponseEntity.ok(schools);
        } catch (Exception e) {
            logger.error("Error fetching deleted schools: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/schools/{schoolId}/details")
    public ResponseEntity<com.littlesteps.playschool.dto.SchoolDetailsDto> getSchoolDetails(@PathVariable String schoolId) {
        try {
            logger.info("Fetching expansive details for school: {}", schoolId);
            com.littlesteps.playschool.dto.SchoolDetailsDto details = superAdminService.getSchoolDetails(schoolId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            logger.error("Error fetching school details: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/admins")
    public ResponseEntity<Page<AdminResponse>> getAllAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            logger.info("Fetching admins (page: {}, size: {})...", page, size);
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<AdminResponse> admins = superAdminService.getAllAdmins(pageable);
            logger.info("Successfully fetched {} admins", admins.getNumberOfElements());
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            logger.error("Error fetching admins: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<com.littlesteps.playschool.dto.DashboardStats> getDashboardData() {
        try {
            logger.info("Fetching dashboard data...");
            com.littlesteps.playschool.dto.DashboardStats stats = superAdminService.getDashboardData();
            logger.info("Successfully fetched dashboard data");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching dashboard data: {}", e.getMessage(), e);
            throw e;
        }
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

    @PutMapping("/schools/{schoolId}/restore")
    public ResponseEntity<Void> restoreSchool(@PathVariable String schoolId) {
        superAdminService.restoreSchool(schoolId);
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
