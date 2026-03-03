package com.littlesteps.playschool.service;

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
    private AuditService auditService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private ParentRegistrationService parentRegistrationService;

    public LoginResponse login(com.littlesteps.playschool.dto.LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpServletRequest) {
        User user = userRepository.findByEmailAndActive(request.getEmail(), true)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            auditService.logActionWithContext(request.getEmail(), "FAILED_LOGIN", "USER", null, null,
                    "Invalid credentials", httpServletRequest);
            throw new RuntimeException("Invalid credentials");
        }

        // Additional checks for ADMIN role
        if (user.getRole() == User.Role.ADMIN) {
            // Check User Status
            if (user.getStatus() != User.Status.ACTIVE) {
                throw new RuntimeException("Your account is not active. Please contact Super Admin.");
            }

            // Check School Assignment
            if (user.getSchoolId() == null || user.getSchoolId().isEmpty()) {
                throw new RuntimeException("No school assigned to this admin account.");
            }

            // Check School Status
            com.littlesteps.playschool.entity.School school = schoolRepository.findById(user.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("Associated school not found"));

            if (school.getStatus() != com.littlesteps.playschool.entity.School.Status.ACTIVE &&
                    school.getStatus() != com.littlesteps.playschool.entity.School.Status.TRIAL) {
                throw new RuntimeException("Your school is currently inactive. Please contact Super Admin.");
            }

            // Check Trial Expiry
            if (school.getStatus() == com.littlesteps.playschool.entity.School.Status.TRIAL) {
                LocalDateTime startDate = school.getTrialStartDate() != null ? school.getTrialStartDate()
                        : school.getCreatedAt();
                if (startDate.isBefore(LocalDateTime.now().minusDays(7))) {
                    throw new RuntimeException(
                            "Trial period expired. Please contact Super Admin to activate your account.");
                }
            }
        }

        // Additional checks for TEACHER role
        if (user.getRole() == User.Role.TEACHER) {
            // Check User Status - BLOCKED teachers cannot login
            if (user.getStatus() != User.Status.ACTIVE) {
                throw new RuntimeException(
                        "Your account is blocked or inactive. Please contact your school administrator.");
            }

            // Check School Assignment
            if (user.getSchoolId() == null || user.getSchoolId().isEmpty()) {
                throw new RuntimeException("No school assigned to this teacher account.");
            }

            // Check School Status
            com.littlesteps.playschool.entity.School school = schoolRepository.findById(user.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("Associated school not found"));

            if (school.getStatus() != com.littlesteps.playschool.entity.School.Status.ACTIVE) {
                throw new RuntimeException("Your school is currently inactive. Please contact your administrator.");
            }
        }

        // Additional checks for PARENT role
        if (user.getRole() == User.Role.PARENT) {
            // Check User Status
            if (user.getStatus() != User.Status.ACTIVE) {
                throw new RuntimeException("Your account is not active. Please contact your school administrator.");
            }

            // Check School Assignment
            if (user.getSchoolId() == null || user.getSchoolId().isEmpty()) {
                throw new RuntimeException("No school assigned to this parent account.");
            }

            // Check School Status
            com.littlesteps.playschool.entity.School school = schoolRepository.findById(user.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("Associated school not found"));

            if (school.getStatus() != com.littlesteps.playschool.entity.School.Status.ACTIVE) {
                throw new RuntimeException("Your school is currently inactive. Please contact the administration.");
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId(), user.getSchoolId());

        // Log successful login
        auditService.logUserLogin(user.getEmail(), httpServletRequest);

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

        // TEACHER role cannot self-register - must be created by Admin
        if (role == User.Role.TEACHER) {
            throw new RuntimeException(
                    "Teacher accounts cannot be created through self-registration. Please contact your school administrator.");
        }

        // ADMIN role cannot self-register - must be created by Super Admin
        if (role == User.Role.ADMIN) {
            throw new RuntimeException(
                    "Admin accounts cannot be created through self-registration. Please contact the Super Admin.");
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