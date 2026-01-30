package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.LoginRequest;
import com.littlesteps.playschool.dto.LoginResponse;
import com.littlesteps.playschool.dto.ParentRegistrationResponse;
import com.littlesteps.playschool.dto.RegisterRequest;
import com.littlesteps.playschool.dto.RegisterResponse;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.SchoolRepository;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private ParentRegistrationService parentRegistrationService;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndActive(request.getEmail(), true)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId(), user.getSchoolId());

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase(),
                token,
                "Little Steps Playschool");
    }

    public RegisterResponse register(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        // Validate role
        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role specified");
        }

        // For parent registration, validate registration code if provided
        if (role == User.Role.PARENT && request.getRegistrationCode() != null
                && !request.getRegistrationCode().isEmpty()) {
            // Validate registration code using ParentRegistrationService
            if (!parentRegistrationService.validateRegistrationCode(request.getRegistrationCode())) {
                throw new RuntimeException("Invalid or expired registration code");
            }
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        // Assign default school if not specified (for now)
        if (schoolRepository.count() > 0) {
            user.setSchoolId(schoolRepository.findAll().get(0).getId());
        }

        // Save user to database
        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name().toLowerCase(),
                "Registration successful! You can now log in.");
    }

    public RegisterResponse registerParentWithCode(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Validate registration code
        if (request.getRegistrationCode() == null || request.getRegistrationCode().isEmpty()) {
            throw new RuntimeException("Registration code is required");
        }

        // Validate registration code using ParentRegistrationService
        if (!parentRegistrationService.validateRegistrationCode(request.getRegistrationCode())) {
            throw new RuntimeException("Invalid or expired registration code");
        }

        // Get parent registration details
        Optional<ParentRegistrationResponse> registrationOpt = parentRegistrationService
                .getRegistrationByCode(request.getRegistrationCode());
        if (!registrationOpt.isPresent()) {
            throw new RuntimeException("Registration code not found");
        }

        ParentRegistrationResponse registration = registrationOpt.get();

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        // Create new parent user using details from registration
        User user = new User();
        user.setName(registration.getParentName());
        user.setEmail(registration.getParentEmail());
        user.setPhone(registration.getParentPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.PARENT);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setSchoolId(registration.getSchoolId());

        // Save user to database
        User savedUser = userRepository.save(user);

        // Mark registration code as used
        parentRegistrationService.markCodeAsUsed(request.getRegistrationCode());

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name().toLowerCase(),
                "Parent registration successful! Welcome to Little Steps Playschool. You can now log in to access your child's information.");
    }
}