package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.AttendanceDTO;
import com.littlesteps.playschool.entity.Attendance;
import com.littlesteps.playschool.entity.AuditLog;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.AttendanceRepository;
import com.littlesteps.playschool.repository.AuditLogRepository;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.security.SchoolContext;
import com.littlesteps.playschool.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/attendance")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public class AdminAttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getAttendance(
            @RequestParam String date,
            @RequestParam(required = false) String className) {
        try {
            LocalDate attendanceDate = LocalDate.parse(date);
            List<AttendanceDTO> attendance;

            if (className != null && !className.isEmpty()) {
                attendance = attendanceService.getAttendanceByDateAndClass(attendanceDate, className);
            } else {
                attendance = attendanceService.getAttendanceByDate(attendanceDate);
            }

            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String newStatus = request.get("status");
            String reason = request.get("reason");

            // Validate reason is provided
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is mandatory for attendance edits"));
            }

            // Fetch existing attendance record
            Attendance attendance = attendanceRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Attendance record not found"));

            // Validate no future date edits
            if (attendance.getAttendanceDate().isAfter(LocalDate.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot edit future attendance records"));
            }

            // Store old status for audit
            String oldStatus = attendance.getStatus() != null ? attendance.getStatus().name() : "NONE";

            // Update the attendance
            attendance.setStatus(Attendance.Status.valueOf(newStatus));
            attendance.setRemarks(reason);
            attendanceRepository.save(attendance);

            // Create audit log
            User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
            String schoolId = SchoolContext.getSchoolId();

            AuditLog auditLog = new AuditLog();
            auditLog.setActorUser(currentUser);
            auditLog.setAction("UPDATE");
            auditLog.setTargetType("ATTENDANCE");
            auditLog.setTargetId(id);
            auditLog.setPayload(String.format("{\"oldStatus\":\"%s\",\"newStatus\":\"%s\",\"reason\":\"%s\"}",
                    oldStatus, newStatus, reason));
            auditLog.setDescription(
                    "Admin edited attendance: " + oldStatus + " -> " + newStatus + ". Reason: " + reason);
            auditLog.setSchoolId(schoolId);
            auditLogRepository.save(auditLog);

            return ResponseEntity.ok(Map.of("message", "Attendance updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getAttendanceSummary(@RequestParam String date) {
        try {
            LocalDate attendanceDate = LocalDate.parse(date);
            Map<String, Object> summary = attendanceService.getAttendanceSummaryByDate(attendanceDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
