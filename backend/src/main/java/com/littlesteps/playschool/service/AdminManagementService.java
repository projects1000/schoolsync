package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.littlesteps.playschool.dto.AdminResponseDTO;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.repository.SchoolRepository;
import java.util.List;

import java.util.stream.Collectors;
import com.littlesteps.playschool.entity.EmailVerificationToken;
import com.littlesteps.playschool.repository.EmailVerificationTokenRepository;
import com.littlesteps.playschool.util.EmailValidationUtil;
import java.util.UUID;

@Service
public class AdminManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public User createAdmin(User user) {
        if (!EmailValidationUtil.isValidEmail(user.getEmail())) {
            throw new IllegalArgumentException("Invalid email address. Please use a real email with valid routing (MX) records.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already in use.");
        }

        // Enforce 1 Admin per specific school logic if needed, but for now allowing
        // creation.
        // Ideally we check if an ADMIN already exists for this schoolId if strictly one
        // per school.
        if (user.getSchoolId() != null) {
            // Enforce 1 Admin per specific school
            if (userRepository.existsBySchoolIdAndRole(user.getSchoolId(), User.Role.ADMIN)) {
                throw new IllegalArgumentException("This school already has an assigned Admin.");
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(User.Role.ADMIN);
        user.setStatus(User.Status.ACTIVE);
        
        User savedAdmin = userRepository.save(user);

        // Generate Verification Token for the new Admin
        String tokenString = UUID.randomUUID().toString();
        EmailVerificationToken evalToken = new EmailVerificationToken(tokenString, savedAdmin, java.time.LocalDateTime.now().plusHours(24));
        tokenRepository.save(evalToken);

        // Dispatch Verification Email
        emailService.sendVerificationEmail(savedAdmin.getEmail(), savedAdmin.getName(), tokenString);

        return savedAdmin;
    }

    @Transactional
    public User updateAdminStatus(String id, User.Status status) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        // status check logic could be refined
        admin.setStatus(status);
        if (status == User.Status.INACTIVE || status == User.Status.SUSPENDED) {
            admin.setActive(false);
        } else {
            admin.setActive(true);
        }
        return userRepository.save(admin);
    }

    @Transactional
    public void resetPassword(String id, String newPassword) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        admin.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(admin);
    }

    public List<AdminResponseDTO> getAllAdmins() {
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        return admins.stream().map(admin -> {
            String schoolName = "Unknown/Unassigned";
            if (admin.getSchoolId() != null) {
                schoolName = schoolRepository.findById(admin.getSchoolId())
                        .map(School::getName)
                        .orElse("Unknown/Unassigned");
            }

            // Fallback: Check if this admin's email is assigned as principal in any school
            if ("Unknown/Unassigned".equals(schoolName)) {
                schoolName = schoolRepository.findByPrincipalEmail(admin.getEmail())
                        .map(School::getName)
                        .orElse("Unknown/Unassigned");
            }
            return new AdminResponseDTO(admin, schoolName);
        }).collect(Collectors.toList());
    }
}
