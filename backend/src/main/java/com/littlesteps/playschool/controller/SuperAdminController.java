package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.AdminResponseDTO;
import com.littlesteps.playschool.dto.SchoolResponseDTO;
import com.littlesteps.playschool.dto.SuperAdminDashboardDTO;
import com.littlesteps.playschool.entity.AcademicYear;
import com.littlesteps.playschool.entity.ClassTemplate;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.service.AcademicMasterService;
import com.littlesteps.playschool.service.AdminManagementService;
import com.littlesteps.playschool.service.BackupService;
import com.littlesteps.playschool.service.SchoolService;
import com.littlesteps.playschool.service.SuperAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class SuperAdminController {

    @Autowired
    private SuperAdminService superAdminService;

    @Autowired
    private SchoolService schoolService;

    @Autowired
    private AdminManagementService adminManagementService;

    @Autowired
    private AcademicMasterService academicMasterService;

    @Autowired
    private BackupService backupService;

    /**
     * Get Super Admin Dashboard data
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<SuperAdminDashboardDTO> getDashboardData() {
        return ResponseEntity.ok(superAdminService.getDashboardData());
    }

    // --- School Management ---

    @PostMapping("/schools")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<School> createSchool(@RequestBody School school) {
        return ResponseEntity.ok(schoolService.createSchool(school));
    }

    @GetMapping("/schools")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<SchoolResponseDTO>> getAllSchools() {
        return ResponseEntity.ok(schoolService.getAllSchools());
    }

    @GetMapping("/schools/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<School> getSchoolById(@PathVariable String id) {
        return schoolService.getSchoolById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/schools/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<School> updateSchool(@PathVariable String id, @RequestBody School school) {
        return ResponseEntity.ok(schoolService.updateSchool(id, school));
    }

    @DeleteMapping("/schools/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> deleteSchool(@PathVariable String id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.ok().build();
    }

    // --- Admin Management ---

    @PostMapping("/admins")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<User> createAdmin(@RequestBody User user) {
        return ResponseEntity.ok(adminManagementService.createAdmin(user));
    }

    @GetMapping("/admins")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<AdminResponseDTO>> getAllAdmins() {
        return ResponseEntity.ok(adminManagementService.getAllAdmins());
    }

    @PutMapping("/admins/{id}/status")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<User> updateAdminStatus(@PathVariable String id, @RequestBody Map<String, String> statusMap) {
        User.Status status = User.Status.valueOf(statusMap.get("status"));
        return ResponseEntity.ok(adminManagementService.updateAdminStatus(id, status));
    }

    @PostMapping("/admins/{id}/reset-password")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> resetAdminPassword(@PathVariable String id,
            @RequestBody Map<String, String> passwordMap) {
        adminManagementService.resetPassword(id, passwordMap.get("password"));
        return ResponseEntity.ok().build();
    }

    // --- Academic Master ---

    @GetMapping("/academic/templates")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<ClassTemplate>> getAllClassTemplates() {
        return ResponseEntity.ok(academicMasterService.getAllClassTemplates());
    }

    @PostMapping("/academic/templates")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<ClassTemplate> createClassTemplate(@RequestBody ClassTemplate template) {
        return ResponseEntity.ok(academicMasterService.createClassTemplate(template));
    }

    @GetMapping("/academic/years")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<AcademicYear>> getAllAcademicYears() {
        return ResponseEntity.ok(academicMasterService.getAllAcademicYears());
    }

    @PostMapping("/academic/years")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<AcademicYear> createAcademicYear(@RequestBody AcademicYear year) {
        return ResponseEntity.ok(academicMasterService.createAcademicYear(year));
    }

    // --- System ---

    @PostMapping("/backup")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<String> performBackup() {
        return ResponseEntity.ok(backupService.performBackup());
    }
}
