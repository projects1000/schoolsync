package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.AttendanceDTO;
import com.littlesteps.playschool.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

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

    @GetMapping("/class/{className}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByClass(
            @PathVariable String className,
            @RequestParam String date) {
        try {
            LocalDate attendanceDate = LocalDate.parse(date);
            List<AttendanceDTO> attendance = attendanceService.getAttendanceByDateAndClass(attendanceDate, className);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(
            @PathVariable String studentId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            List<AttendanceDTO> attendance;
            if (startDate != null && endDate != null) {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                attendance = attendanceService.getStudentAttendanceByDateRange(studentId, start, end);
            } else {
                attendance = attendanceService.getStudentAttendance(studentId);
            }
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<List<AttendanceDTO>> saveAttendance(@RequestBody List<AttendanceDTO> attendanceList) {
        try {
            List<AttendanceDTO> savedAttendance = attendanceService.saveAttendance(attendanceList);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAttendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceDTO> updateAttendance(
            @PathVariable String id,
            @RequestBody AttendanceDTO attendanceDTO) {
        try {
            AttendanceDTO updatedAttendance = attendanceService.updateAttendance(id, attendanceDTO);
            return ResponseEntity.ok(updatedAttendance);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
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

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAttendanceAnalytics(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) String className) {
        try {
            Map<String, Object> analytics = attendanceService.getAttendanceAnalytics(period, className);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable String id) {
        try {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}