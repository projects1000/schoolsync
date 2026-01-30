package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.SuperAdminDashboardDTO;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.SchoolRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.repository.ClassesRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SuperAdminService {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private ClassesRepository classesRepository;

    public SuperAdminDashboardDTO getDashboardData() {
        SuperAdminDashboardDTO dto = new SuperAdminDashboardDTO();

        // 1. Basic Counts
        long totalSchools = schoolRepository.count();
        long activeSchools = schoolRepository.countByStatus(School.Status.ACTIVE);
        long inactiveSchools = totalSchools - activeSchools; // Approximate or use specific status
        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();

        dto.setTotalSchools(totalSchools);
        dto.setActiveSchools(activeSchools);
        dto.setInactiveSchools(inactiveSchools);
        dto.setTotalStudents(totalStudents);
        dto.setTotalTeachers(totalTeachers);
        dto.setTotalAdmins(userRepository.countByRole(User.Role.ADMIN));
        dto.setTotalParents(userRepository.countByRole(User.Role.PARENT));

        // 2. Charts Data
        dto.setAttendanceTrend(getAttendanceTrend());
        dto.setSchoolGrowth(getSchoolGrowth());
        dto.setStudentGrowth(getStudentGrowthYearly()); // New

        // 3. Complex Aggregation: Students per School
        Map<String, Long> studentsPerSchool = calculateSchoolStudentCounts();
        Map<String, Long> schoolNameDistribution = new HashMap<>(); // Name -> Count

        // Map School ID to Name for display
        List<School> allSchools = schoolRepository.findAll();
        Map<String, String> schoolIdToName = allSchools.stream()
                .collect(Collectors.toMap(School::getId, School::getName));

        for (Map.Entry<String, Long> entry : studentsPerSchool.entrySet()) {
            String schoolName = schoolIdToName.getOrDefault(entry.getKey(), "Unknown School");
            schoolNameDistribution.put(schoolName,
                    schoolNameDistribution.getOrDefault(schoolName, 0L) + entry.getValue());
        }
        dto.setStudentDistribution(schoolNameDistribution);

        // 4. Widgets Data
        dto.setRecentSchools(getRecentSchools(studentsPerSchool));
        dto.setActiveAdmins(getActiveAdmins());

        // 5. Placeholders (Mock logic with real data structure if possible, or empty)
        dto.setSystemAlerts(getSystemAlerts());
        dto.setPendingActions(getPendingActions());

        return dto;
    }

    // --- Helper Methods ---

    /**
     * Calculates student count per school by traversing:
     * Student -> className -> Classes.name
     * Classes.classTeacher -> Teacher
     * Teacher.user -> User
     * User.schoolId -> School
     */
    private Map<String, Long> calculateSchoolStudentCounts() {
        Map<String, Long> schoolStudentCounts = new HashMap<>();

        // Fetch all necessary data (assuming dataset is small enough for memory)
        // Optimization: Use Mongo aggregations for larger datasets

        List<Student> students = studentRepository.findAll();
        List<Classes> classes = classesRepository.findAll();
        List<Teacher> teachers = teacherRepository.findAll();
        List<User> users = userRepository.findAll(); // Or filter by Role.TEACHER/ADMIN

        // Indexing for O(1) lookups
        Map<String, String> classToTeacherId = classes.stream()
                .filter(c -> c.getClassTeacher() != null)
                .collect(Collectors.toMap(Classes::getName, c -> c.getClassTeacher().getId(), (a, b) -> a)); // Handle
                                                                                                             // dupes

        Map<String, String> teacherToUserId = teachers.stream()
                .filter(t -> t.getUser() != null)
                .collect(Collectors.toMap(Teacher::getId, t -> t.getUser().getId()));

        Map<String, String> userToSchoolId = users.stream()
                .filter(u -> u.getSchoolId() != null)
                .collect(Collectors.toMap(User::getId, User::getSchoolId));

        for (Student student : students) {
            String className = student.getClassName();
            if (className == null)
                continue;

            String teacherId = classToTeacherId.get(className);
            if (teacherId == null)
                continue;

            String userId = teacherToUserId.get(teacherId);
            if (userId == null)
                continue;

            String schoolId = userToSchoolId.get(userId);
            if (schoolId != null) {
                schoolStudentCounts.put(schoolId, schoolStudentCounts.getOrDefault(schoolId, 0L) + 1);
            }
        }
        return schoolStudentCounts;
    }

    private List<SuperAdminDashboardDTO.RecentSchool> getRecentSchools(Map<String, Long> studentCounts) {
        return schoolRepository
                .findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                        "createdAt"))
                .stream()
                .limit(5)
                .map(school -> {
                    int count = studentCounts.getOrDefault(school.getId(), 0L).intValue();
                    String dateStr = school.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
                    return new SuperAdminDashboardDTO.RecentSchool(
                            school.getId(), school.getName(), school.getCity(), count, school.getStatus().toString(),
                            dateStr);
                })
                .collect(Collectors.toList());
    }

    private List<SuperAdminDashboardDTO.ActiveAdmin> getActiveAdmins() {
        // We can't easily sort by lastLogin if it's null, so we filter first
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);

        // Sort in memory for simplicity or use DB sort
        admins.sort((u1, u2) -> {
            if (u1.getLastLogin() == null)
                return 1;
            if (u2.getLastLogin() == null)
                return -1;
            return u2.getLastLogin().compareTo(u1.getLastLogin());
        });

        return admins.stream()
                .limit(5)
                .map(admin -> {
                    String schoolName = "Unknown"; // Logic to find school (same as AdminManagementService)
                    if (admin.getSchoolId() != null) {
                        schoolName = schoolRepository.findById(admin.getSchoolId()).map(School::getName)
                                .orElse("Unknown");
                    } else {
                        schoolName = schoolRepository.findByPrincipalEmail(admin.getEmail()).map(School::getName)
                                .orElse("Unknown");
                    }

                    String lastLogin = admin.getLastLogin() != null
                            ? admin.getLastLogin().format(DateTimeFormatter.ofPattern("hh:mm a"))
                            : "Never";

                    // Check if login was today
                    if (admin.getLastLogin() != null) {
                        long minutes = java.time.Duration.between(admin.getLastLogin(), LocalDateTime.now())
                                .toMinutes();
                        if (minutes < 60)
                            lastLogin = minutes + " mins ago";
                        else if (minutes < 1440)
                            lastLogin = (minutes / 60) + " hours ago";
                    }

                    return new SuperAdminDashboardDTO.ActiveAdmin(
                            admin.getId(), admin.getName(), schoolName, lastLogin);
                })
                .collect(Collectors.toList());
    }

    private List<SuperAdminDashboardDTO.StudentGrowthYearly> getStudentGrowthYearly() {
        List<SuperAdminDashboardDTO.StudentGrowthYearly> growth = new ArrayList<>();
        // Aggregate by year of createdAt
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.project().andExpression("year(createdAt)").as("year"),
                Aggregation.group("year").count().as("count"),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.ASC, "_id"));
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "students", Map.class);

        // long runningTotal = 0; // Cumulative logic is below
        // Or just total per year? Screenshot: "Year-over-year trend".
        // The graph line goes UP constantly. That implies cumulative total users over
        // time.

        // But let's look at the data points: 2020, 2021...
        // If I just count "students joined in 2020", it might fluctuate.
        // I will calculate CUMULATIVE total.

        // Fetch all years
        Map<Integer, Long> yearlyAdds = new TreeMap<>();
        for (Map doc : results.getMappedResults()) {
            Integer year = doc.get("_id") != null ? ((Number) doc.get("_id")).intValue() : LocalDate.now().getYear();
            long count = doc.get("count") != null ? ((Number) doc.get("count")).longValue() : 0;
            yearlyAdds.put(year, count);
        }

        if (yearlyAdds.isEmpty()) {
            // Fallback for demo if no students
            growth.add(new SuperAdminDashboardDTO.StudentGrowthYearly(String.valueOf(LocalDate.now().getYear()), 0));
            return growth;
        }

        // Calculate cumulative
        long cumulative = 0;
        // Start from first year found
        int startYear = yearlyAdds.keySet().iterator().next();
        int currentYear = LocalDate.now().getYear();

        for (int y = startYear; y <= currentYear; y++) {
            cumulative += yearlyAdds.getOrDefault(y, 0L);
            growth.add(new SuperAdminDashboardDTO.StudentGrowthYearly(String.valueOf(y), cumulative));
        }

        return growth;
    }

    private List<SuperAdminDashboardDTO.SystemAlert> getSystemAlerts() {
        // Placeholder: Generate based on real conditions if possible
        List<SuperAdminDashboardDTO.SystemAlert> alerts = new ArrayList<>();

        // Delayed Backups? (Check backup service logs? Dummy for now as no BackupLog
        // entity)
        // High Server Load? (Dummy)
        // Inactive Schools count?
        long suspended = schoolRepository.countByStatus(School.Status.SUSPENDED);
        if (suspended > 0) {
            alerts.add(new SuperAdminDashboardDTO.SystemAlert(
                    "1", "Suspended Schools", suspended + " schools are currently suspended", "Now", "warning"));
        }

        return alerts;
    }

    private List<SuperAdminDashboardDTO.PendingAction> getPendingActions() {
        List<SuperAdminDashboardDTO.PendingAction> actions = new ArrayList<>();
        // Example: Schools in "INACTIVE" state might need approval?
        long inactive = schoolRepository.countByStatus(School.Status.INACTIVE);
        if (inactive > 0) {
            actions.add(new SuperAdminDashboardDTO.PendingAction(
                    "1", "Inactive Schools", inactive + " schools pending activation", "Today", "High"));
        }
        return actions;
    }

    private List<SuperAdminDashboardDTO.AttendanceTrend> getAttendanceTrend() {
        List<SuperAdminDashboardDTO.AttendanceTrend> trends = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.format(formatter);

            // Aggregation to count attendance by date and status
            Aggregation agg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("attendanceDate").is(date)),
                    Aggregation.group("status").count().as("count"),
                    Aggregation.project("count").and("status").previousOperation());

            AggregationResults<Map> results = mongoTemplate.aggregate(agg, "attendance", Map.class);

            long present = 0, absent = 0, total = 0;
            for (Map doc : results.getMappedResults()) {
                // Fix: _id in group is the status string
                String status = doc.get("_id") != null ? doc.get("_id").toString() : "";
                int count = doc.get("count") != null ? ((Number) doc.get("count")).intValue() : 0;

                if ("PRESENT".equals(status)) {
                    present = count;
                } else if ("ABSENT".equals(status)) {
                    absent = count;
                }
                total += count;
            }

            trends.add(new SuperAdminDashboardDTO.AttendanceTrend(dateStr, present, absent, total));
        }

        return trends;
    }

    private List<SuperAdminDashboardDTO.SchoolGrowth> getSchoolGrowth() {
        List<SuperAdminDashboardDTO.SchoolGrowth> growth = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");

        for (int i = 11; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            String monthStr = monthStart.format(formatter);

            // Aggregation to count schools created in this month
            Aggregation agg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("createdAt")
                            .gte(monthStart.atStartOfDay())
                            .lte(monthEnd.atTime(23, 59, 59))),
                    Aggregation.count().as("count"));

            AggregationResults<Map> results = mongoTemplate.aggregate(agg, "schools", Map.class);

            long count = 0;
            if (!results.getMappedResults().isEmpty()) {
                Map doc = results.getMappedResults().get(0);
                count = doc.get("count") != null ? ((Number) doc.get("count")).longValue() : 0;
            }

            growth.add(new SuperAdminDashboardDTO.SchoolGrowth(monthStr, count));
        }

        return growth;
    }

    // End of file

}
