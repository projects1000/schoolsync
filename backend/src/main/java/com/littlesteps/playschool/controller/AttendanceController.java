package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.dto.AttendanceDTO;
import com.littlesteps.playschool.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AttendanceController {

    @Autowired
    private com.littlesteps.playschool.repository.UserRepository userRepository;

    @Autowired
    private com.littlesteps.playschool.repository.StudentRepository studentRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ClassesRepository classesRepository;

    @Autowired
    private com.littlesteps.playschool.repository.AttendanceRepository attendanceRepository;

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<?> getAttendance(
            @RequestParam String date,
            @RequestParam(required = false) String className,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        try {
            LocalDate attendanceDate = LocalDate.parse(date);
            String[] sortParts = sort.split(",");
            Sort sortObj = Sort.by(sortParts[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                    sortParts[0]);
            Pageable pageable = PageRequest.of(page, size, sortObj);

            Page<AttendanceDTO> attendance;
            if (className != null && !className.isEmpty()) {
                attendance = attendanceService.getAttendanceByDateAndClass(attendanceDate, className, pageable);
            } else {
                attendance = attendanceService.getAttendanceByDate(attendanceDate, pageable);
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
    public ResponseEntity<?> saveAttendance(@RequestBody List<AttendanceDTO> attendanceList,
            org.springframework.security.core.Authentication authentication) {
        try {
            if (attendanceList == null || attendanceList.isEmpty()) {
                return ResponseEntity.badRequest().body("Attendance list cannot be empty");
            }

            // Permission Check: Verify currentUser is Class Teacher of the student's class
            // We check the first student in the list assuming batch is for one class
            String studentId = attendanceList.get(0).getStudentId();
            if (!hasAttendancePermission(authentication.getName(), studentId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only Class Teacher or Admin can mark attendance");
            }

            List<AttendanceDTO> savedAttendance = attendanceService.saveAttendance(attendanceList);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAttendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable String id,
            @RequestBody AttendanceDTO attendanceDTO,
            org.springframework.security.core.Authentication authentication) {
        try {
            // Permission Check
            // We need studentId. If DTO doesn't have it (it might not on update?), we need
            // to fetch existing attendance.
            // But checking DTO first is faster if provided.
            // For safety, let's skip DTO check and check existing record inside service?
            // Or fetch attendance here to check permission.
            // Fetching attendance requires repository.
            // Let's rely on DTO having studentId, or fetch.
            // Actually, we can fetch Student from DTO if present.
            // If DTO.studentId is null, we can't check easily without fetching record.
            // Let's assume passed DTO has studentId (which it should for UI).
            // Better: use a service method to check permission?
            // Let's fetch the attendance record to get studentId to be sure.
            // But we can't fetch it easily here without Service.

            // For now, assume DTO has studentId. If not, we might need a workaround.
            // Wait, we can use the studentId from the DTO.

            String studentId = attendanceDTO.getStudentId();

            // If studentId not in DTO, fetch from existing record
            if (studentId == null) {
                com.littlesteps.playschool.entity.Attendance existing = attendanceRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Attendance not found"));
                if (existing.getStudent() != null) {
                    studentId = existing.getStudent().getId();
                }
            }

            if (studentId != null && !hasAttendancePermission(authentication.getName(), studentId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only Class Teacher or Admin can update attendance");
            }

            AttendanceDTO updatedAttendance = attendanceService.updateAttendance(id, attendanceDTO);
            return ResponseEntity.ok(updatedAttendance);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Autowired
    private com.littlesteps.playschool.repository.TeacherRepository teacherRepository;

    private boolean hasAttendancePermission(String email, String studentId) {
        if (studentId == null) return false;
        com.littlesteps.playschool.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == com.littlesteps.playschool.entity.User.Role.ADMIN ||
                user.getRole() == com.littlesteps.playschool.entity.User.Role.SUPERADMIN) {
            return true;
        }

        com.littlesteps.playschool.entity.Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String classId = student.getClassId();
        if (classId == null)
            return false;

        com.littlesteps.playschool.entity.Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (classes.getClassTeacherId() != null) {
            com.littlesteps.playschool.entity.Teacher teacher = teacherRepository.findById(classes.getClassTeacherId())
                    .orElse(null);

            if (teacher != null && teacher.getUser() != null && teacher.getUser().getId().equals(user.getId())) {
                return true;
            }
        }

        return false;
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