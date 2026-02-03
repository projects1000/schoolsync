package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.InviteCreateDTO;
import com.littlesteps.playschool.dto.InviteAcceptDTO;
import com.littlesteps.playschool.entity.Invite;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.Parent;
import com.littlesteps.playschool.repository.InviteRepository;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing user invitations
 * Handles invite creation, validation, acceptance, and lifecycle management
 */
@Service
public class InviteService {

    @Autowired
    private InviteRepository inviteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final int INVITE_EXPIRY_DAYS = 7;

    /**
     * Create a new invite
     */
    @Transactional
    public Invite createInvite(InviteCreateDTO inviteDTO, String creatorId) {
        // Check if user already exists with this email
        if (userRepository.findByEmail(inviteDTO.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        // Check if there's already a pending invite for this email and role
        inviteRepository.findByEmailAndRoleAndStatus(
                inviteDTO.getEmail(),
                Invite.Role.valueOf(inviteDTO.getRole()),
                Invite.Status.PENDING).ifPresent(existingInvite -> {
                    throw new RuntimeException("Pending invite already exists for this email and role");
                });

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        Invite invite = new Invite();
        invite.setInviteCode(generateUniqueInviteCode());
        invite.setEmail(inviteDTO.getEmail());
        invite.setRole(Invite.Role.valueOf(inviteDTO.getRole()));
        invite.setStatus(Invite.Status.PENDING);
        invite.setCreatedBy(creator);
        invite.setCreatedAt(LocalDateTime.now());
        invite.setExpiresAt(LocalDateTime.now().plusDays(INVITE_EXPIRY_DAYS));

        invite = inviteRepository.save(invite);

        // Log the invite creation
        auditService.logAction(
                creator.getEmail(),
                "INVITE_CREATED",
                "Invite",
                invite.getId(),
                Map.of(
                        "email", invite.getEmail(),
                        "role", invite.getRole().toString(),
                        "inviteCode", invite.getInviteCode()),
                "Invite created for " + invite.getEmail());

        return invite;
    }

    /**
     * Get all invites with optional filtering
     */
    /**
     * Get all invites with optional filtering
     */
    public Page<Invite> getAllInvites(PageRequest pageRequest, String status, String role) {
        if (status != null && !status.isEmpty() && role != null && !role.isEmpty()) {
            return inviteRepository.findByRoleAndStatus(
                    Invite.Role.valueOf(role.toUpperCase()),
                    Invite.Status.valueOf(status.toUpperCase()),
                    pageRequest);
        }

        if (status != null && !status.isEmpty()) {
            return inviteRepository.findByStatus(
                    Invite.Status.valueOf(status.toUpperCase()),
                    pageRequest);
        }

        if (role != null && !role.isEmpty()) {
            return inviteRepository.findByRole(
                    Invite.Role.valueOf(role.toUpperCase()),
                    pageRequest);
        }

        return inviteRepository.findAll(pageRequest);
    }

    /**
     * Get invite by ID
     */
    public Invite getInviteById(String id) {
        return inviteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invite not found"));
    }

    /**
     * Get invite by code
     */
    public Invite getInviteByCode(String code) {
        return inviteRepository.findByInviteCode(code)
                .orElseThrow(() -> new RuntimeException("Invite not found"));
    }

    /**
     * Check if invite is valid (not expired, not used, etc.)
     */
    public boolean isInviteValid(Invite invite) {
        return invite.getStatus() == Invite.Status.PENDING &&
                invite.getExpiresAt().isAfter(LocalDateTime.now());
    }

    /**
     * Accept an invite and create user account
     */
    @Transactional
    public Map<String, Object> acceptInvite(String inviteCode, InviteAcceptDTO acceptDTO) {
        Invite invite = getInviteByCode(inviteCode);

        // Validate invite
        if (!isInviteValid(invite)) {
            throw new RuntimeException("Invite is expired or already used");
        }

        // Check if user already exists
        if (userRepository.findByEmail(invite.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        // Create user account
        User user = new User();
        user.setEmail(invite.getEmail());
        user.setUsername(invite.getEmail()); // Use email as username
        user.setPassword(passwordEncoder.encode(acceptDTO.getPassword()));
        user.setRole(User.Role.valueOf(invite.getRole().toString()));
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());

        user = userRepository.save(user);

        // Create role-specific record
        createRoleSpecificRecord(user, invite.getRole(), acceptDTO);

        // Update invite status
        invite.setStatus(Invite.Status.ACCEPTED);
        invite.setAcceptedBy(user);
        invite.setAcceptedAt(LocalDateTime.now());
        inviteRepository.save(invite);

        // Log the acceptance
        auditService.logAction(
                user.getEmail(),
                "INVITE_ACCEPTED",
                "Invite",
                invite.getId(),
                Map.of(
                        "email", invite.getEmail(),
                        "role", invite.getRole().toString(),
                        "userId", user.getId()),
                "Invite accepted by " + user.getEmail());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Invite accepted successfully");
        result.put("userId", user.getId());
        result.put("email", user.getEmail());
        result.put("role", user.getRole().toString());

        return result;
    }

    /**
     * Cancel an invite
     */
    @Transactional
    public void cancelInvite(String inviteId, String adminId) {
        Invite invite = getInviteById(inviteId);

        if (invite.getStatus() != Invite.Status.PENDING) {
            throw new RuntimeException("Can only cancel pending invites");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        invite.setStatus(Invite.Status.CANCELLED);
        inviteRepository.save(invite);

        // Log the cancellation
        auditService.logAction(
                admin.getEmail(),
                "INVITE_CANCELLED",
                "Invite",
                invite.getId(),
                Map.of(
                        "email", invite.getEmail(),
                        "role", invite.getRole().toString(),
                        "cancelledBy", admin.getName()),
                "Invite cancelled for " + invite.getEmail());
    }

    /**
     * Resend an invite (generate new code and extend expiry)
     */
    @Transactional
    public Invite resendInvite(String inviteId, String adminId) {
        Invite invite = getInviteById(inviteId);

        if (invite.getStatus() == Invite.Status.ACCEPTED) {
            throw new RuntimeException("Cannot resend accepted invites");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Generate new invite code and extend expiry
        invite.setInviteCode(generateUniqueInviteCode());
        invite.setStatus(Invite.Status.PENDING);
        invite.setExpiresAt(LocalDateTime.now().plusDays(INVITE_EXPIRY_DAYS));

        invite = inviteRepository.save(invite);

        // Log the resend
        auditService.logAction(
                admin.getEmail(),
                "INVITE_RESENT",
                "Invite",
                invite.getId(),
                Map.of(
                        "email", invite.getEmail(),
                        "role", invite.getRole().toString(),
                        "newInviteCode", invite.getInviteCode(),
                        "resentBy", admin.getName()),
                "Invite resent for " + invite.getEmail());

        return invite;
    }

    /**
     * Get invite statistics
     */
    public Map<String, Object> getInviteStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalInvites", inviteRepository.count());
        stats.put("pendingInvites", inviteRepository.countByStatus(Invite.Status.PENDING));
        stats.put("acceptedInvites", inviteRepository.countByStatus(Invite.Status.ACCEPTED));
        stats.put("expiredInvites", inviteRepository.countByStatus(Invite.Status.EXPIRED));
        stats.put("cancelledInvites", inviteRepository.countByStatus(Invite.Status.CANCELLED));

        // Calculate acceptance rate
        long total = inviteRepository.count();
        long accepted = inviteRepository.countByStatus(Invite.Status.ACCEPTED);
        double acceptanceRate = total > 0 ? (double) accepted / total * 100 : 0;
        stats.put("acceptanceRate", Math.round(acceptanceRate * 100.0) / 100.0);

        return stats;
    }

    // Private helper methods
    private String generateUniqueInviteCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        } while (inviteRepository.findByInviteCode(code).isPresent());
        return code;
    }

    private void createRoleSpecificRecord(User user, Invite.Role role, InviteAcceptDTO acceptDTO) {
        switch (role) {
            case TEACHER:
                Teacher teacher = new Teacher();
                teacher.setUser(user);
                teacher.setName(acceptDTO.getName());
                teacher.setPhone(acceptDTO.getPhoneNumber());
                teacher.setDepartment(acceptDTO.getDepartment());
                teacher.setQualification(acceptDTO.getQualification());
                teacher.setExperience(acceptDTO.getExperience());
                teacher.setStatus(Teacher.Status.ACTIVE);
                teacher.setJoiningDate(LocalDateTime.now().toLocalDate());
                // Generate employee ID
                String employeeId = "EMP" + String.format("%04d", teacherRepository.count() + 1);
                teacher.setEmployeeId(employeeId);
                teacherRepository.save(teacher);
                break;

            case PARENT:
                Parent parent = new Parent();
                parent.setUserId(user.getId());
                parent.setName(acceptDTO.getName());
                parent.setEmail(user.getEmail());
                parent.setPhoneNumber(acceptDTO.getPhoneNumber());
                parent.setAddress(acceptDTO.getAddress());
                // Map relationship string to enum
                if (acceptDTO.getRelationship() != null) {
                    try {
                        parent.setRelation(Parent.RelationType.valueOf(acceptDTO.getRelationship().toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        parent.setRelation(Parent.RelationType.FATHER); // Default
                    }
                }
                parent.setStatus(Parent.Status.ACTIVE);
                parentRepository.save(parent);
                break;
        }
    }
}