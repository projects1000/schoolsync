package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.LoginRequest;
import com.littlesteps.playschool.dto.LoginResponse;
import com.littlesteps.playschool.dto.RegisterRequest;
import com.littlesteps.playschool.dto.RegisterResponse;
import com.littlesteps.playschool.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpServletRequest) {
        try {
            logger.info("Login attempt for email: {}", request.getEmail());
            LoginResponse response = authService.login(request, httpServletRequest);
            logger.info("Login successful for user: {}", response.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login failed: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            RegisterResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register-parent")
    public ResponseEntity<?> registerParent(@RequestBody RegisterRequest request) {
        try {
            RegisterResponse response = authService.registerParentWithCode(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Parent registration failed: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register-superadmin")
    public ResponseEntity<?> registerSuperAdmin(@RequestBody RegisterRequest request) {
        try {
            // Force role to be superadmin for this endpoint
            request.setRole("SUPERADMIN");
            RegisterResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("SuperAdmin registration failed: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}