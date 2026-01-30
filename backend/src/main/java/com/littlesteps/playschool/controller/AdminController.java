package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.CreateAdminRequest;
import com.littlesteps.playschool.dto.AdminResponse;
import com.littlesteps.playschool.dto.ParentRegistrationRequest;
import com.littlesteps.playschool.dto.ParentRegistrationResponse;
import com.littlesteps.playschool.entity.ParentRegistration;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.service.AdminService;
import com.littlesteps.playschool.service.ParentRegistrationService;
import com.littlesteps.playschool.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ParentRegistrationService parentRegistrationService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/clear-and-reset-users")
    public ResponseEntity<Map<String, Object>> clearAndResetUsers() {
        // SECURITY: This endpoint is disabled for production safety
        Map<String, Object> response = new HashMap<>();
        response.put("error", "This operation is disabled for security reasons");
        response.put("message", "User reset functionality has been disabled to prevent data loss");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @PostMapping("/reset-demo-users")
    public ResponseEntity<Map<String, Object>> resetDemoUsers() {
        // SECURITY: This endpoint is disabled for production safety
        Map<String, Object> response = new HashMap<>();
        response.put("error", "This operation is disabled for security reasons");
        response.put("message", "Demo user reset functionality has been disabled to prevent security vulnerabilities");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // Parent Registration Management Endpoints

    @PostMapping("/create-parent-registration")
    public ResponseEntity<Map<String, Object>> createParentRegistration(
            @Valid @RequestBody ParentRegistrationRequest request,
            Authentication authentication) {
        try {
            String createdBy = authentication.getName(); // Get admin username
            ParentRegistrationResponse registration = parentRegistrationService.createParentRegistration(request,
                    createdBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Parent registration created successfully!");
            response.put("registration", registration);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create parent registration: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/parent-registrations")
    public ResponseEntity<Map<String, Object>> getAllParentRegistrations() {
        try {
            List<ParentRegistrationResponse> registrations = parentRegistrationService.getAllRegistrations();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("registrations", registrations);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch parent registrations: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/parent-registrations/pending")
    public ResponseEntity<Map<String, Object>> getPendingParentRegistrations() {
        try {
            List<ParentRegistrationResponse> registrations = parentRegistrationService
                    .getRegistrationsByStatus(ParentRegistration.RegistrationStatus.PENDING);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("registrations", registrations);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch pending parent registrations: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/parent-registrations/{code}")
    public ResponseEntity<Map<String, Object>> getParentRegistrationByCode(@PathVariable String code) {
        try {
            Optional<ParentRegistrationResponse> registration = parentRegistrationService.getRegistrationByCode(code);

            if (registration.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("registration", registration.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Registration code not found");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch parent registration: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/parent-registrations/{id}")
    public ResponseEntity<Map<String, Object>> deleteParentRegistration(@PathVariable String id) {
        try {
            parentRegistrationService.deleteRegistration(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Parent registration deleted successfully!");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete parent registration: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/validate-registration-code/{code}")
    public ResponseEntity<Map<String, Object>> validateRegistrationCode(@PathVariable String code) {
        try {
            boolean isValid = parentRegistrationService.validateRegistrationCode(code);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("valid", isValid);
            response.put("message",
                    isValid ? "Registration code is valid" : "Registration code is invalid or already used");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to validate registration code: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Admin Management Endpoints

    /**
     * Create a new admin - Only SUPERADMIN can access
     */
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(
            @Valid @RequestBody CreateAdminRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            User currentUser = getCurrentUser(token);
            AdminResponse response = adminService.createAdmin(request, currentUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create admin: " + e.getMessage()));
        }
    }

    /**
     * Get all admins - Both SUPERADMIN and ADMIN can access
     */
    @GetMapping("/list-admins")
    public ResponseEntity<?> getAllAdmins(@RequestHeader("Authorization") String token) {
        try {
            User currentUser = getCurrentUser(token);
            List<AdminResponse> admins = adminService.getAllAdmins(currentUser);
            return ResponseEntity.ok(admins);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch admins: " + e.getMessage()));
        }
    }

    /**
     * Update admin status - Only SUPERADMIN can access
     */
    @PutMapping("/admin/{adminId}/status")
    public ResponseEntity<?> updateAdminStatus(
            @PathVariable String adminId,
            @RequestBody Map<String, Boolean> statusUpdate,
            @RequestHeader("Authorization") String token) {
        try {
            User currentUser = getCurrentUser(token);
            boolean active = statusUpdate.get("active");
            AdminResponse response = adminService.updateAdminStatus(adminId, active, currentUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update admin status: " + e.getMessage()));
        }
    }

    /**
     * Check current user permissions
     */
    @GetMapping("/permissions")
    public ResponseEntity<?> getUserPermissions(@RequestHeader("Authorization") String token) {
        try {
            User currentUser = getCurrentUser(token);
            Map<String, Object> permissions = Map.of(
                    "isSuperAdmin", adminService.isSuperAdmin(currentUser),
                    "hasAdminPrivileges", adminService.hasAdminPrivileges(currentUser),
                    "role", currentUser.getRole().name(),
                    "canCreateAdmins", adminService.isSuperAdmin(currentUser));
            return ResponseEntity.ok(permissions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token: " + e.getMessage()));
        }
    }

    /**
     * Get admin count for verification
     */
    @GetMapping("/count")
    public ResponseEntity<?> getAdminCount(@RequestHeader("Authorization") String token) {
        try {
            User currentUser = getCurrentUser(token);
            if (!adminService.hasAdminPrivileges(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            long count = adminService.getAdminCount();
            return ResponseEntity.ok(Map.of("totalAdmins", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get admin count: " + e.getMessage()));
        }
    }

    /**
     * Verify admin exists by email
     */
    @GetMapping("/verify-email/{email}")
    public ResponseEntity<?> verifyAdminEmail(
            @PathVariable String email,
            @RequestHeader("Authorization") String token) {
        try {
            User currentUser = getCurrentUser(token);
            if (!adminService.isSuperAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied. Super Admin required."));
            }

            boolean exists = adminService.adminExistsByEmail(email);
            return ResponseEntity.ok(Map.of("exists", exists, "email", email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to verify email: " + e.getMessage()));
        }
    }

    /**
     * Debug endpoint to check user details and test login credentials
     */
    @PostMapping("/debug-user")
    public ResponseEntity<?> debugUser(
            @RequestBody Map<String, String> credentials,
            @RequestHeader("Authorization") String token) {
        try {
            User currentUser = getCurrentUser(token);
            if (!adminService.isSuperAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied. Super Admin required."));
            }

            String email = credentials.get("email");
            String password = credentials.get("password");

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                return ResponseEntity.ok(Map.of(
                        "found", false,
                        "message", "User with email " + email + " not found in database"));
            }

            User user = userOpt.get();
            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());

            Map<String, Object> debug = Map.of(
                    "found", true,
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole().name(),
                    "active", user.getActive(),
                    "passwordMatches", passwordMatches,
                    "encodedPassword",
                    user.getPassword().substring(0, Math.min(20, user.getPassword().length())) + "...",
                    "createdAt", user.getCreatedAt());

            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Debug failed: " + e.getMessage()));
        }
    }

    private User getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header is missing or invalid");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.getEmailFromToken(token);

        return userRepository.findByEmailAndActive(email, true)
                .orElseThrow(() -> new RuntimeException("User not found or inactive"));
    }
}