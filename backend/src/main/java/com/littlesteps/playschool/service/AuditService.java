package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.AuditLog;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.AuditLogRepository;
import com.littlesteps.playschool.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Log an audit event with minimal information
     */
    public void logAction(String username, String action, String targetType, String targetId) {
        logAction(username, action, targetType, targetId, null, null);
    }

    /**
     * Log an audit event with payload
     */
    public void logAction(String username, String action, String targetType, String targetId, Object payload) {
        logAction(username, action, targetType, targetId, payload, null);
    }

    /**
     * Log an audit event with payload and description
     */
    public void logAction(String username, String action, String targetType, String targetId,
            Object payload, String description) {
        try {
            User actorUser = userRepository.findByEmail(username).orElse(null);
            String schoolId = actorUser != null ? actorUser.getSchoolId() : null;

            String payloadJson = null;
            if (payload != null) {
                payloadJson = objectMapper.writeValueAsString(payload);
            }

            AuditLog auditLog = new AuditLog(actorUser, action, targetType, targetId, payloadJson, description,
                    schoolId);
            auditLogRepository.save(auditLog);
        } catch (JsonProcessingException e) {
            // Log the error but don't fail the operation
            System.err.println("Failed to serialize audit payload: " + e.getMessage());
            // Save without payload
            User actorUser = userRepository.findByEmail(username).orElse(null);
            String schoolId = actorUser != null ? actorUser.getSchoolId() : null;

            AuditLog auditLog = new AuditLog(actorUser, action, targetType, targetId, null, description, schoolId);
            auditLogRepository.save(auditLog);
        }
    }

    /**
     * Log an audit event with HTTP request context
     */
    public void logActionWithContext(String username, String action, String targetType, String targetId,
            Object payload, String description, HttpServletRequest request) {
        try {
            User actorUser = userRepository.findByEmail(username).orElse(null);
            String schoolId = actorUser != null ? actorUser.getSchoolId() : null;

            String payloadJson = null;
            if (payload != null) {
                payloadJson = objectMapper.writeValueAsString(payload);
            }

            AuditLog auditLog = new AuditLog(actorUser, action, targetType, targetId, payloadJson, description,
                    schoolId);

            if (request != null) {
                auditLog.setIpAddress(getClientIpAddress(request));
                auditLog.setUserAgent(request.getHeader("User-Agent"));
            }

            auditLogRepository.save(auditLog);
        } catch (JsonProcessingException e) {
            // Log without payload if serialization fails
            User actorUser = userRepository.findByEmail(username).orElse(null);
            String schoolId = actorUser != null ? actorUser.getSchoolId() : null;

            AuditLog auditLog = new AuditLog(actorUser, action, targetType, targetId, null, description, schoolId);

            if (request != null) {
                auditLog.setIpAddress(getClientIpAddress(request));
                auditLog.setUserAgent(request.getHeader("User-Agent"));
            }

            auditLogRepository.save(auditLog);
        }
    }

    /**
     * Get audit logs with pagination
     */
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * Get audit logs by action
     */
    public Page<AuditLog> getAuditLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByActionOrderByCreatedAtDesc(action, pageable);
    }

    /**
     * Get audit logs by user
     */
    public List<AuditLog> getAuditLogsByUser(User user) {
        return auditLogRepository.findByActorUser(user);
    }

    /**
     * Get audit logs by target
     */
    public List<AuditLog> getAuditLogsByTarget(String targetType, String targetId) {
        return auditLogRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }

    /**
     * Get audit logs by date range
     */
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByCreatedAtBetween(start, end);
    }

    /**
     * Get all distinct actions
     */
    public List<String> getDistinctActions() {
        return auditLogRepository.findAllActions().stream()
                .map(AuditLog::getAction)
                .distinct()
                .toList();
    }

    /**
     * Get all distinct target types
     */
    public List<String> getDistinctTargetTypes() {
        return auditLogRepository.findAllTargetTypes().stream()
                .map(AuditLog::getTargetType)
                .distinct()
                .toList();
    }

    /**
     * Get user activity count
     */
    public long getUserActivityCount(User user) {
        return auditLogRepository.countByActorUser(user);
    }

    /**
     * Get recent activity count
     */
    public long getRecentActivityCount(LocalDateTime since) {
        return auditLogRepository.countSince(since);
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    // Convenience methods for common audit actions

    public void logUserLogin(String username, HttpServletRequest request) {
        logActionWithContext(username, "LOGIN", "USER", null, null, "User logged in", request);
    }

    public void logUserLogout(String username) {
        logAction(username, "LOGOUT", "USER", null, null, "User logged out");
    }

    public void logTeacherCreated(String username, String teacherId, Map<String, Object> teacherData) {
        logAction(username, "CREATE_TEACHER", "TEACHER", teacherId, teacherData, "New teacher created");
    }

    public void logTeacherUpdated(String username, String teacherId, Map<String, Object> changes) {
        logAction(username, "UPDATE_TEACHER", "TEACHER", teacherId, changes, "Teacher information updated");
    }

    public void logTeacherDeactivated(String username, String teacherId) {
        logAction(username, "DEACTIVATE_TEACHER", "TEACHER", teacherId, null, "Teacher deactivated");
    }

    public void logTeacherBlocked(String username, String teacherId, Map<String, Object> details) {
        logAction(username, "BLOCK_TEACHER", "TEACHER", teacherId, details, "Teacher blocked - access revoked");
    }

    public void logTeacherUnblocked(String username, String teacherId, Map<String, Object> details) {
        logAction(username, "UNBLOCK_TEACHER", "TEACHER", teacherId, details, "Teacher unblocked - access restored");
    }

    public void logStudentCreated(String username, String studentId, Map<String, Object> studentData) {
        logAction(username, "CREATE", "STUDENT", studentId, studentData, "New student created");
    }

    public void logParentCreated(String username, String parentId, Map<String, Object> parentData) {
        logAction(username, "CREATE_PARENT", "PARENT", parentId, parentData, "New parent created");
    }

    public void logParentUpdated(String username, String parentId) {
        logAction(username, "UPDATE_PARENT", "PARENT", parentId, null, "Parent information updated");
    }

    public void logParentStudentMapped(String username, String parentId, String studentId, String schoolId) {
        logSchoolAction(username, "MAP_PARENT_STUDENT", "PARENT", parentId, schoolId, Map.of("studentId", studentId),
                "Student mapped to parent");
    }

    public void logParentStudentUnmapped(String username, String parentId, String studentId, String schoolId) {
        logSchoolAction(username, "UNMAP_PARENT_STUDENT", "PARENT", parentId, schoolId, Map.of("studentId", studentId),
                "Student unmapped from parent");
    }

    public void logParentBlocked(String username, String parentId, String schoolId) {
        logSchoolAction(username, "BLOCK_PARENT", "PARENT", parentId, schoolId, null, "Parent blocked");
    }

    public void logParentUnblocked(String username, String parentId, String schoolId) {
        logSchoolAction(username, "UNBLOCK_PARENT", "PARENT", parentId, schoolId, null, "Parent unblocked");
    }

    public void logParentPasswordReset(String username, String parentId, String schoolId) {
        logSchoolAction(username, "RESET_PARENT_PASSWORD", "PARENT", parentId, schoolId, null, "Parent password reset");
    }

    /**
     * Log an action with explicit School ID (useful for Super Admin actions)
     */
    public void logSchoolAction(String username, String action, String targetType, String targetId, String schoolId,
            Object payload, String description) {
        try {
            User actorUser = userRepository.findByEmail(username).orElse(null);

            String payloadJson = null;
            if (payload != null) {
                payloadJson = objectMapper.writeValueAsString(payload);
            }

            AuditLog auditLog = new AuditLog(actorUser, action, targetType, targetId, payloadJson, description,
                    schoolId);
            auditLogRepository.save(auditLog);
        } catch (JsonProcessingException e) {
            System.err.println("Failed to serialize audit payload: " + e.getMessage());
            User actorUser = userRepository.findByEmail(username).orElse(null);
            AuditLog auditLog = new AuditLog(actorUser, action, targetType, targetId, null, description, schoolId);
            auditLogRepository.save(auditLog);
        }
    }

    public void logRollNumberRecalculation(String username, String classId, String sectionId,
            List<String> affectedStudentIds, String schoolId) {
        User actorUser = userRepository.findByEmail(username).orElse(null);
        AuditLog auditLog = new AuditLog();
        auditLog.setActorUser(actorUser);
        auditLog.setAction("ROLL_NO_RECALCULATED");
        auditLog.setTargetType("CLASS_SECTION");
        auditLog.setTargetId(classId + ":" + sectionId); // Composite ID for reference
        auditLog.setClassId(classId);
        auditLog.setSectionId(sectionId);
        auditLog.setAffectedStudentIds(affectedStudentIds);
        auditLog.setSchoolId(schoolId);
        auditLog.setDescription("Roll numbers recalculated for class " + classId + ", section " + sectionId);
        auditLog.setCreatedAt(java.time.LocalDateTime.now());

        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAuditLogs(String schoolId, String targetId, String action) {
        if (targetId != null && action != null) {
            return auditLogRepository.findBySchoolIdAndTargetIdAndAction(schoolId, targetId, action);
        } else if (schoolId != null) {
            return auditLogRepository.findBySchoolId(schoolId);
        }
        return java.util.Collections.emptyList();
    }
}
