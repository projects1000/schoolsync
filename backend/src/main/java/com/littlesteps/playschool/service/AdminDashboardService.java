package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.AdminDashboardDTO;
import com.littlesteps.playschool.entity.Attendance;
import com.littlesteps.playschool.entity.AuditLog;
import com.littlesteps.playschool.entity.FeeInvoice;
import com.littlesteps.playschool.repository.AttendanceRepository;

import com.littlesteps.playschool.repository.FeeInvoiceRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.security.SchoolContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

        @Autowired
        private StudentRepository studentRepository;

        @Autowired
        private TeacherRepository teacherRepository;

        @Autowired
        private AttendanceRepository attendanceRepository;

        @Autowired
        private FeeInvoiceRepository feeInvoiceRepository;

        @Autowired
        private MongoTemplate mongoTemplate;

        @Transactional(readOnly = true)
        @Cacheable(value = "admin_dashboard", key = "T(com.littlesteps.playschool.security.SchoolContext).getSchoolId()")
        public AdminDashboardDTO getDashboardStats() {
                String schoolId = SchoolContext.getSchoolId();
                System.out.println("DEBUG: Dashboard fetching stats for schoolId: " + schoolId);
                if (schoolId == null) {
                        System.out.println("DEBUG: schoolId is NULL, returning empty stats");
                        return new AdminDashboardDTO();
                }

                // 1. Total Students
                long totalStudents = studentRepository.countBySchoolIdAndStatus(schoolId,
                                com.littlesteps.playschool.entity.Student.Status.ACTIVE);

                // 2. Total Teachers
                long totalTeachers = teacherRepository.countBySchoolIdAndStatus(schoolId,
                                com.littlesteps.playschool.entity.Teacher.Status.ACTIVE);

                // 3. Attendance Percentage (Today)
                LocalDate today = LocalDate.now();
                List<Attendance> todayAttendance = attendanceRepository.findBySchoolIdAndAttendanceDate(schoolId,
                                today);

                long presentCount = todayAttendance.stream()
                                .filter(a -> a.getStatus() == Attendance.Status.PRESENT
                                                || a.getStatus() == Attendance.Status.HALF_DAY
                                                || a.getStatus() == Attendance.Status.LATE)
                                .count();

                double attendancePercentage = 0.0;
                if (totalStudents > 0) {
                        attendancePercentage = ((double) presentCount / totalStudents) * 100;
                }

                // 4. Pending Fees
                List<FeeInvoice> pendingInvoices = feeInvoiceRepository.findBySchoolIdAndStatus(schoolId,
                                FeeInvoice.Status.PENDING);

                BigDecimal pendingFees = pendingInvoices.stream()
                                .map(FeeInvoice::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // 5. Recent Activities
                // Added in 1459, but repository method should be added to avoid mongoTemplate
                // dependency
                // PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC,
                // "createdAt"));
                // Need to add findBySchoolId to AuditLogRepository
                Query logQuery = new Query(Criteria.where("schoolId").is(schoolId))
                                .with(Sort.by(Sort.Direction.DESC, "createdAt"))
                                .limit(10);
                List<AuditLog> recent;
                try {
                        recent = mongoTemplate.find(logQuery, AuditLog.class);
                } catch (Exception e) {
                        System.err.println("ERROR: Failed to fetch recent activities: " + e.getMessage());
                        recent = java.util.Collections.emptyList();
                }

                return new AdminDashboardDTO(totalStudents, totalTeachers, attendancePercentage, pendingFees, recent);
        }
}
