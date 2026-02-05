package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.AttendanceDTO;
import com.littlesteps.playschool.entity.Attendance;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.repository.AttendanceRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

        @Autowired
        private AttendanceRepository attendanceRepository;

        @Autowired
        private StudentRepository studentRepository;

        public List<AttendanceDTO> getAttendanceByDate(LocalDate date) {
                List<Attendance> attendances = attendanceRepository.findByAttendanceDate(date);
                return attendances.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<AttendanceDTO> getAttendanceByDateAndClass(LocalDate date, String className) {
                // DBRef queries on nested fields don't work reliably in MongoDB
                // Fetch all attendance for date and filter in-memory
                List<Attendance> allAttendance = attendanceRepository.findByAttendanceDate(date);
                return allAttendance.stream()
                                .filter(a -> a.getStudent() != null &&
                                                className.equalsIgnoreCase(a.getStudent().getClassName()))
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<AttendanceDTO> getStudentAttendance(String studentId) {
                List<Attendance> attendances = attendanceRepository.findByStudentIdAndDateRange(
                                studentId, LocalDate.now().minusMonths(1), LocalDate.now());
                return attendances.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<AttendanceDTO> getStudentAttendanceByDateRange(String studentId, LocalDate startDate,
                        LocalDate endDate) {
                List<Attendance> attendances = attendanceRepository.findByStudentIdAndDateRange(studentId, startDate,
                                endDate);
                return attendances.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<AttendanceDTO> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
                // Fetch all within range. filtering by class logic happens in Service layer if
                // needed.
                // Assuming repository has findByAttendanceDateBetween or we use findAll
                // filtering.
                // Repository usually has findAll or we can use custom query.
                // Let's use filter on findAll for now to match analytics implementation style,
                // or if repository has method. Analytics used findAll().filter range.
                List<Attendance> attendances = attendanceRepository.findAll().stream()
                                .filter(a -> !a.getAttendanceDate().isBefore(startDate) &&
                                                !a.getAttendanceDate().isAfter(endDate))
                                .collect(Collectors.toList());
                return attendances.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<AttendanceDTO> saveAttendance(List<AttendanceDTO> attendanceDTOs) {
                List<Attendance> attendances = attendanceDTOs.stream()
                                .map(this::convertToEntity)
                                .collect(Collectors.toList());

                List<Attendance> savedAttendances = attendanceRepository.saveAll(attendances);
                return savedAttendances.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public AttendanceDTO updateAttendance(String id, AttendanceDTO attendanceDTO) {
                Attendance existingAttendance = attendanceRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

                existingAttendance.setStatus(Attendance.Status.valueOf(attendanceDTO.getStatus()));
                existingAttendance.setCheckInTime(attendanceDTO.getArrivalTime());
                existingAttendance.setRemarks(attendanceDTO.getNotes());

                Attendance savedAttendance = attendanceRepository.save(existingAttendance);
                return convertToDTO(savedAttendance);
        }

        public void deleteAttendance(String id) {
                if (!attendanceRepository.existsById(id)) {
                        throw new RuntimeException("Attendance record not found");
                }
                attendanceRepository.deleteById(id);
        }

        public Map<String, Object> getAttendanceSummaryByDate(LocalDate date) {
                List<Attendance> allAttendance = attendanceRepository.findByAttendanceDate(date);

                Map<String, Object> result = new HashMap<>();
                int totalStudents = allAttendance.size();
                long totalPresent = allAttendance.stream()
                                .filter(a -> a.getStatus() == Attendance.Status.PRESENT ||
                                                a.getStatus() == Attendance.Status.LATE)
                                .count();

                result.put("overall", Map.of(
                                "totalStudents", totalStudents,
                                "totalPresent", totalPresent,
                                "percentage", totalStudents > 0 ? (totalPresent * 100.0 / totalStudents) : 0));

                return result;
        }

        public Map<String, Object> getAttendanceAnalytics(String period, String className) {
                Map<String, Object> analytics = new HashMap<>();

                LocalDate endDate = LocalDate.now();
                LocalDate startDate = switch (period.toLowerCase()) {
                        case "week" -> endDate.minusWeeks(1);
                        case "month" -> endDate.minusMonths(1);
                        case "year" -> endDate.minusYears(1);
                        default -> endDate.minusMonths(1);
                };

                // Get all attendance records for the period
                List<Attendance> attendances = attendanceRepository.findAll().stream()
                                .filter(a -> !a.getAttendanceDate().isBefore(startDate) &&
                                                !a.getAttendanceDate().isAfter(endDate))
                                .collect(Collectors.toList());

                long totalRecords = attendances.size();
                long presentCount = attendances.stream()
                                .filter(a -> a.getStatus() == Attendance.Status.PRESENT ||
                                                a.getStatus() == Attendance.Status.LATE)
                                .count();

                analytics.put("totalRecords", totalRecords);
                analytics.put("presentCount", presentCount);
                analytics.put("absentCount", totalRecords - presentCount);
                analytics.put("attendancePercentage", totalRecords > 0 ? (presentCount * 100.0 / totalRecords) : 0);
                analytics.put("period", period);
                analytics.put("startDate", startDate);
                analytics.put("endDate", endDate);

                return analytics;
        }

        private AttendanceDTO convertToDTO(Attendance attendance) {
                AttendanceDTO dto = new AttendanceDTO();
                dto.setId(attendance.getId());

                // Handle null student reference (broken DBRef)
                if (attendance.getStudent() != null) {
                        dto.setStudentId(attendance.getStudent().getId());
                        dto.setStudentName(attendance.getStudent().getName());
                        dto.setClassName(attendance.getStudent().getClassName());
                } else {
                        dto.setStudentId(null);
                        dto.setStudentName("Unknown Student");
                        dto.setClassName("N/A");
                }

                dto.setAttendanceDate(attendance.getAttendanceDate());
                dto.setStatus(attendance.getStatus() != null ? attendance.getStatus().name() : "ABSENT");
                dto.setArrivalTime(attendance.getCheckInTime());
                dto.setNotes(attendance.getRemarks());
                return dto;
        }

        private Attendance convertToEntity(AttendanceDTO dto) {
                Student student = studentRepository.findById(dto.getStudentId())
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setAttendanceDate(dto.getAttendanceDate());
                attendance.setStatus(Attendance.Status.valueOf(dto.getStatus()));
                attendance.setCheckInTime(dto.getArrivalTime());
                attendance.setRemarks(dto.getNotes());

                return attendance;
        }
}