package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.CreateAdminRequest;
import com.littlesteps.playschool.dto.AdminResponse;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.SchoolRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.littlesteps.playschool.entity.EmailVerificationToken;
import com.littlesteps.playschool.repository.EmailVerificationTokenRepository;
import com.littlesteps.playschool.util.EmailValidationUtil;
import java.util.UUID;

@Service
@Transactional
@CacheConfig(cacheNames = "admins")
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

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

    /**
     * Create a new admin user - Only SUPERADMIN can create new admins
     */
    @Transactional
    @CacheEvict(value = {"admins", "schools"}, allEntries = true)
    public AdminResponse createAdmin(CreateAdminRequest request, User currentUser) {
        logger.info("Creating new admin with email: {} by user: {}", request.getEmail(), currentUser.getEmail());

        // Check if current user is SUPERADMIN
        if (currentUser.getRole() != User.Role.SUPERADMIN) {
            logger.error("Access denied. User {} with role {} attempted to create admin",
                    currentUser.getEmail(), currentUser.getRole());
            throw new RuntimeException("Access denied. Only Super Admin can create new admins.");
        }

        if (!EmailValidationUtil.isValidEmail(request.getEmail() != null ? request.getEmail() : "")) {
            throw new RuntimeException("Invalid email address. Please use a real email with valid routing (MX) records.");
        }

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            logger.error("Attempt to create admin with existing email: {}", request.getEmail());
            throw new RuntimeException("User with this email already exists");
        }

        // Check school if provided
        String schoolName = null;
        if (request.getSchoolId() != null) {
            School school = schoolRepository.findById(request.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("School not found"));
            schoolName = school.getName();

            if (school.getAdminId() != null) {
                throw new RuntimeException("School already has an admin assigned");
            }
        }

        try {
            // Create new admin user
            User admin = new User();
            admin.setName(request.getName());
            admin.setEmail(request.getEmail());
            admin.setPhone(request.getPhone());
            admin.setPassword(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : ""));
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            admin.setSchoolId(request.getSchoolId());
            admin.setStatus(User.Status.ACTIVE);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setCreatedBy(currentUser.getId());

            // Save admin to database
            User savedAdmin = userRepository.save(admin);
            
            // Generate Verification Token for the new Admin
            String tokenString = UUID.randomUUID().toString();
            EmailVerificationToken evalToken = new EmailVerificationToken(tokenString, savedAdmin, LocalDateTime.now().plusHours(24));
            tokenRepository.save(evalToken);

            // Dispatch Verification Email
            emailService.sendVerificationEmail(savedAdmin.getEmail(), savedAdmin.getName(), tokenString);

            logger.info("Successfully created admin with ID: {} and email: {}",
                    savedAdmin.getId(), savedAdmin.getEmail());

            if (request.getSchoolId() != null) {
                School school = schoolRepository.findById(request.getSchoolId()).get();
                school.setAdminId(savedAdmin.getId());
                school.setPrincipalName(savedAdmin.getName());
                school.setPrincipalEmail(savedAdmin.getEmail());
                schoolRepository.save(school);
            }

            return AdminResponse.fromUser(savedAdmin, schoolName);

        } catch (Exception e) {
            logger.error("Error creating admin: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create admin: " + e.getMessage());
        }
    }

    /**
     * Get all admins - Both SUPERADMIN and ADMIN can view
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'all'")
    public List<AdminResponse> getAllAdmins(User currentUser) {
        logger.info("Fetching all admins requested by user: {}", currentUser.getEmail());

        // Check if current user has admin privileges
        if (currentUser.getRole() != User.Role.SUPERADMIN && currentUser.getRole() != User.Role.ADMIN) {
            logger.error("Access denied. User {} with role {} attempted to view admins",
                    currentUser.getEmail(), currentUser.getRole());
            throw new RuntimeException("Access denied. Admin privileges required.");
        }

        List<User> admins = userRepository.findByRoleInAndActive(
                List.of(User.Role.SUPERADMIN, User.Role.ADMIN), true);

        // Fetch school names map
        List<String> schoolIds = admins.stream()
                .map(User::getSchoolId)
                .filter(id -> id != null)
                .collect(Collectors.toList());
        Map<String, String> schoolIdToName = schoolRepository.findAllById(schoolIds).stream()
                .collect(Collectors.toMap(School::getId, School::getName));

        logger.info("Found {} active admins in database", admins.size());

        return admins.stream()
                .map(admin -> {
                    String sName = admin.getSchoolId() != null ? schoolIdToName.get(admin.getSchoolId()) : null;
                    return AdminResponse.fromUser(admin, sName);
                })
                .collect(Collectors.toList());
    }

    /**
     * Update admin status - Only SUPERADMIN can update
     */
    @CacheEvict(value = {"admins", "schools"}, allEntries = true)
    public AdminResponse updateAdminStatus(String adminId, boolean active, User currentUser) {
        // Check if current user is SUPERADMIN
        if (currentUser.getRole() != User.Role.SUPERADMIN) {
            throw new RuntimeException("Access denied. Only Super Admin can update admin status.");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Prevent deactivating the last super admin
        if (admin.getRole() == User.Role.SUPERADMIN && !active) {
            long superAdminCount = userRepository.countByRoleAndActive(User.Role.SUPERADMIN, true);
            if (superAdminCount <= 1) {
                throw new RuntimeException("Cannot deactivate the last Super Admin");
            }
        }

        admin.setActive(active);
        admin.setStatus(active ? User.Status.ACTIVE : User.Status.SUSPENDED);
        User updatedAdmin = userRepository.save(admin);

        String sName = null;
        if (updatedAdmin.getSchoolId() != null) {
            sName = schoolRepository.findById(updatedAdmin.getSchoolId())
                    .map(School::getName).orElse(null);
        }

        return AdminResponse.fromUser(updatedAdmin, sName);
    }

    /**
     * Check if user has super admin privileges
     */
    public boolean isSuperAdmin(User user) {
        return user.getRole() == User.Role.SUPERADMIN;
    }

    /**
     * Check if user has admin privileges (SUPERADMIN or ADMIN)
     */
    public boolean hasAdminPrivileges(User user) {
        return user.getRole() == User.Role.SUPERADMIN || user.getRole() == User.Role.ADMIN;
    }

    /**
     * Get count of admins in database for verification
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "'count'")
    public long getAdminCount() {
        long superAdminCount = userRepository.countByRoleAndActive(User.Role.SUPERADMIN, true);
        long adminCount = userRepository.countByRoleAndActive(User.Role.ADMIN, true);
        long totalCount = superAdminCount + adminCount;

        logger.info("Admin count - SuperAdmins: {}, Admins: {}, Total: {}",
                superAdminCount, adminCount, totalCount);

        return totalCount;
    }

    /**
     * Verify admin exists in database by email
     */
    @Transactional(readOnly = true)
    @Cacheable(key = "#email")
    public boolean adminExistsByEmail(String email) {
        boolean exists = userRepository.findByEmail(email).isPresent();
        logger.info("Admin exists check for email {}: {}", email, exists);
        return exists;
    }
}