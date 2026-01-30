package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.LoginRequest;
import com.littlesteps.playschool.dto.LoginResponse;
import com.littlesteps.playschool.dto.RegisterRequest;
import com.littlesteps.playschool.dto.RegisterResponse;
import com.littlesteps.playschool.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        try {
            RegisterResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            RegisterResponse errorResponse = new RegisterResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/register-parent")
    public ResponseEntity<RegisterResponse> registerParent(@RequestBody RegisterRequest request) {
        try {
            RegisterResponse response = authService.registerParentWithCode(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            RegisterResponse errorResponse = new RegisterResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/register-superadmin")
    public ResponseEntity<RegisterResponse> registerSuperAdmin(@RequestBody RegisterRequest request) {
        try {
            // Force role to be superadmin for this endpoint
            request.setRole("SUPERADMIN");
            RegisterResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            RegisterResponse errorResponse = new RegisterResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}