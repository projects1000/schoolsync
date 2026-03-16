package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.SecurityLogsResponse;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.service.AuditService;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<SecurityLogsResponse> getSecurityLogsDashboard(@AuthenticationPrincipal String email) {
        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        String targetSchoolId = currentUser.getSchoolId();

        // Superadmins might view all / default if not bound
        if (currentUser.getRole() == User.Role.SUPERADMIN) {
            targetSchoolId = null; // Fetch all for Super Admin
        }

        SecurityLogsResponse response = auditService.getSecurityLogsDashboard(targetSchoolId);
        return ResponseEntity.ok(response);
    }
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> getAuditLogs(
            @AuthenticationPrincipal String email,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String targetId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String action,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String tab,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") int size) {

        User currentUser = userRepository.findByEmail(email).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        String targetSchoolId = currentUser.getSchoolId();
        if (currentUser.getRole() == User.Role.SUPERADMIN) {
            targetSchoolId = null; // Fetch all for Super Admin
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        org.springframework.data.domain.Page<com.littlesteps.playschool.entity.AuditLog> logs = auditService.getAuditLogs(targetSchoolId, targetId, action, tab, pageable);
        return ResponseEntity.ok(logs.map(auditService::mapToDTO));
    }
}
