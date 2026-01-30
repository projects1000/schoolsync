package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.CreateAdminRequest;
import com.littlesteps.playschool.dto.AdminResponse;
// Imports will be fixed generically if needed, but for now focusing on methods
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new admin user - Only SUPERADMIN can create new admins
     */
    @Transactional
    public AdminResponse createAdmin(CreateAdminRequest request, User currentUser) {
        logger.info("Creating new admin with email: {} by user: {}", request.getEmail(), currentUser.getEmail());

        // Check if current user is SUPERADMIN
        if (currentUser.getRole() != User.Role.SUPERADMIN) {
            logger.error("Access denied. User {} with role {} attempted to create admin",
                    currentUser.getEmail(), currentUser.getRole());
            throw new RuntimeException("Access denied. Only Super Admin can create new admins.");
        }

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            logger.error("Attempt to create admin with existing email: {}", request.getEmail());
            throw new RuntimeException("User with this email already exists");
        }

        try {
            // Create new admin user
            User admin = new User();
            admin.setName(request.getName());
            admin.setEmail(request.getEmail());
            admin.setPhone(request.getPhone());
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            admin.setCreatedAt(LocalDateTime.now());

            // Save admin to database
            User savedAdmin = userRepository.save(admin);
            logger.info("Successfully created admin with ID: {} and email: {}",
                    savedAdmin.getId(), savedAdmin.getEmail());

            // Verify the admin was saved by fetching from database
            User verifyAdmin = userRepository.findById(savedAdmin.getId())
                    .orElseThrow(() -> new RuntimeException("Failed to verify admin creation"));

            logger.info("Verified admin creation in database. Admin ID: {}, Name: {}, Email: {}, Role: {}",
                    verifyAdmin.getId(), verifyAdmin.getName(), verifyAdmin.getEmail(), verifyAdmin.getRole());

            return new AdminResponse(
                    savedAdmin.getId(),
                    savedAdmin.getName(),
                    savedAdmin.getEmail(),
                    savedAdmin.getPhone(),
                    savedAdmin.getRole().name(),
                    savedAdmin.getActive(),
                    savedAdmin.getCreatedAt());
        } catch (Exception e) {
            logger.error("Error creating admin: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create admin: " + e.getMessage());
        }
    }

    /**
     * Get all admins - Both SUPERADMIN and ADMIN can view
     */
    @Transactional(readOnly = true)
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

        logger.info("Found {} active admins in database", admins.size());

        return admins.stream()
                .map(admin -> new AdminResponse(
                        admin.getId(),
                        admin.getName(),
                        admin.getEmail(),
                        admin.getPhone(),
                        admin.getRole().name(),
                        admin.getActive(),
                        admin.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**
     * Update admin status - Only SUPERADMIN can update
     */
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
        User updatedAdmin = userRepository.save(admin);

        return new AdminResponse(
                updatedAdmin.getId(),
                updatedAdmin.getName(),
                updatedAdmin.getEmail(),
                updatedAdmin.getPhone(),
                updatedAdmin.getRole().name(),
                updatedAdmin.getActive(),
                updatedAdmin.getCreatedAt());
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
    public boolean adminExistsByEmail(String email) {
        boolean exists = userRepository.findByEmail(email).isPresent();
        logger.info("Admin exists check for email {}: {}", email, exists);
        return exists;
    }
}