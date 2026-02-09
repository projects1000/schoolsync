package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.AttendanceDTO;
import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.dto.TeacherDashboardDTO;
import com.littlesteps.playschool.service.TeacherDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class TeacherDashboardController {

    @Autowired
    private TeacherDashboardService teacherDashboardService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<TeacherDashboardDTO> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        TeacherDashboardDTO dashboardData = teacherDashboardService.getDashboardData(email);
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<StudentDTO>> getMyStudents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherDashboardService.getMyStudents(email));
    }

    @GetMapping("/attendance/classes")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, String>>> getMyClasses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        // Only return classes where teacher is the CLASS TEACHER (for attendance
        // marking)
        return ResponseEntity.ok(teacherDashboardService.getClassTeacherClasses(email));
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<AttendanceDTO>> getMyAttendance(
            @RequestParam String date,
            @RequestParam(required = false) String className) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherDashboardService.getAttendance(email, date, className));
    }

    @PutMapping("/attendance/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AttendanceDTO> updateAttendance(@PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(teacherDashboardService.updateAttendance(id, body.get("status"), body.get("reason")));
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<AttendanceDTO>> markAttendance(@RequestBody List<AttendanceDTO> attendanceList) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherDashboardService.saveAttendance(email, attendanceList));
    }

    @GetMapping("/classes")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, String>>> getMyAssignedClasses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherDashboardService.getAssignedClasses(email));
    }

    @GetMapping("/classes/{classId}/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<StudentDTO>> getStudentsByClass(@PathVariable String classId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherDashboardService.getStudentsByClassId(email, classId));
    }

    @GetMapping("/attendance/history/{classId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceHistory(
            @PathVariable String classId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherDashboardService.getAttendanceHistory(email, classId,
                java.time.LocalDate.parse(startDate), java.time.LocalDate.parse(endDate)));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<com.littlesteps.playschool.dto.TeacherProfileDTO> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherDashboardService.getProfile(email));
    }

    @GetMapping("/role-info")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<com.littlesteps.playschool.dto.TeacherRoleInfoDTO> getRoleInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(teacherDashboardService.getTeacherRoleInfo(email));
    }

}
