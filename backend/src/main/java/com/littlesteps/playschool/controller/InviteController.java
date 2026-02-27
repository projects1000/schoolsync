package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.InviteCreateDTO;
import com.littlesteps.playschool.dto.InviteResponseDTO;
import com.littlesteps.playschool.dto.InviteAcceptDTO;
import com.littlesteps.playschool.entity.Invite;
import com.littlesteps.playschool.service.InviteService;
import com.littlesteps.playschool.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.HashMap;

/**
 * REST Controller for managing invitations
 * Handles invite creation, acceptance, and management operations
 */
@RestController
@RequestMapping("/api")
public class InviteController {

    @Autowired
    private InviteService inviteService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Create a new invite (Admin only)
     */
    @PostMapping("/admin/invites")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> createInvite(@Valid @RequestBody InviteCreateDTO inviteDTO,
            HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            String creatorId = jwtUtil.getUserIdFromToken(token);

            Invite invite = inviteService.createInvite(inviteDTO, creatorId);
            InviteResponseDTO responseDTO = convertToResponseDTO(invite);

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all invites with pagination and filtering (Admin only)
     */
    @GetMapping("/admin/invites")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Page<InviteResponseDTO>> getAllInvites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Invite> invites = inviteService.getAllInvites(pageRequest, status, role);
        Page<InviteResponseDTO> response = invites.map(this::convertToResponseDTO);

        return ResponseEntity.ok(response);
    }

    /**
     * Get invite by ID (Admin only)
     */
    @GetMapping("/admin/invites/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> getInviteById(@PathVariable String id) {
        try {
            Invite invite = inviteService.getInviteById(id);
            InviteResponseDTO responseDTO = convertToResponseDTO(invite);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get invite by code (Public endpoint for invitation acceptance)
     */
    @GetMapping("/public/invites/{code}")
    public ResponseEntity<?> getInviteByCode(@PathVariable String code) {
        try {
            Invite invite = inviteService.getInviteByCode(code);

            // Only return basic info for public access
            Map<String, Object> response = new HashMap<>();
            response.put("inviteCode", invite.getInviteCode());
            response.put("role", invite.getRole().toString());
            response.put("status", invite.getStatus().toString());
            response.put("expiresAt", invite.getExpiresAt());
            response.put("isValid", inviteService.isInviteValid(invite));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid or expired invite code");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Accept an invite (Public endpoint)
     */
    @PostMapping("/public/invites/{code}/accept")
    public ResponseEntity<?> acceptInvite(@PathVariable String code,
            @Valid @RequestBody InviteAcceptDTO acceptDTO) {
        try {
            Map<String, Object> result = inviteService.acceptInvite(code, acceptDTO);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Cancel an invite (Admin only)
     */
    @PutMapping("/admin/invites/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> cancelInvite(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            String adminId = jwtUtil.getUserIdFromToken(token);

            inviteService.cancelInvite(id, adminId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Invite cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Resend an invite (Admin only)
     */
    @PostMapping("/admin/invites/{id}/resend")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> resendInvite(@PathVariable String id, HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            String adminId = jwtUtil.getUserIdFromToken(token);

            Invite invite = inviteService.resendInvite(id, adminId);
            InviteResponseDTO responseDTO = convertToResponseDTO(invite);

            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get invite statistics (Admin only)
     */
    @GetMapping("/admin/invites/statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> getInviteStatistics() {
        try {
            Map<String, Object> stats = inviteService.getInviteStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Helper methods
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("No valid token found");
    }

    private InviteResponseDTO convertToResponseDTO(Invite invite) {
        InviteResponseDTO dto = new InviteResponseDTO();
        dto.setId(invite.getId());
        dto.setInviteCode(invite.getInviteCode());
        dto.setEmail(invite.getEmail());
        dto.setRole(invite.getRole().toString());
        dto.setStatus(invite.getStatus().toString());
        dto.setCreatedAt(invite.getCreatedAt());
        dto.setExpiresAt(invite.getExpiresAt());
        dto.setAcceptedAt(invite.getAcceptedAt());

        if (invite.getCreatedBy() != null) {
            dto.setCreatedBy(invite.getCreatedBy().getName());
        }

        if (invite.getAcceptedBy() != null) {
            dto.setAcceptedBy(invite.getAcceptedBy().getName());
        }

        return dto;
    }
}