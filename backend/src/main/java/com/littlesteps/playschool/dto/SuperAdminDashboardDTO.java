package com.littlesteps.playschool.dto;

import java.util.List;
import java.util.Map;

public class SuperAdminDashboardDTO {

    private long totalSchools;
    private long activeSchools;
    private long inactiveSchools;
    private long totalStudents;
    private long totalTeachers;
    private long totalAdmins;
    private long totalParents;

    private List<AttendanceTrend> attendanceTrend;
    private List<SchoolGrowth> schoolGrowth;
    private List<StudentGrowthYearly> studentGrowth;
    private Map<String, Long> studentDistribution;

    private List<RecentSchool> recentSchools;
    private List<ActiveAdmin> activeAdmins;
    private List<SystemAlert> systemAlerts;
    private List<PendingAction> pendingActions;

    // Constructors
    public SuperAdminDashboardDTO() {
    }

    // Inner Classes
    public static class AttendanceTrend {
        private String date;
        private long present;
        private long absent;
        private long total;
        private double attendancePercentage;

        public AttendanceTrend() {
        }

        public AttendanceTrend(String date, long present, long absent, long total) {
            this.date = date;
            this.present = present;
            this.absent = absent;
            this.total = total;
            this.attendancePercentage = total > 0 ? (double) present / total * 100 : 0;
        }

        // Getters/Setters
        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public long getPresent() {
            return present;
        }

        public void setPresent(long present) {
            this.present = present;
        }

        public long getAbsent() {
            return absent;
        }

        public void setAbsent(long absent) {
            this.absent = absent;
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }

        public double getAttendancePercentage() {
            return attendancePercentage;
        }

        public void setAttendancePercentage(double attendancePercentage) {
            this.attendancePercentage = attendancePercentage;
        }
    }

    public static class SchoolGrowth {
        private String month;
        private long schoolsAdded;

        public SchoolGrowth() {
        }

        public SchoolGrowth(String month, long schoolsAdded) {
            this.month = month;
            this.schoolsAdded = schoolsAdded;
        }

        // Getters/Setters
        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public long getSchoolsAdded() {
            return schoolsAdded;
        }

        public void setSchoolsAdded(long schoolsAdded) {
            this.schoolsAdded = schoolsAdded;
        }
    }

    public static class StudentGrowthYearly {
        private String year;
        private long totalStudents;

        public StudentGrowthYearly() {
        }

        public StudentGrowthYearly(String year, long totalStudents) {
            this.year = year;
            this.totalStudents = totalStudents;
        }

        public String getYear() {
            return year;
        }

        public void setYear(String year) {
            this.year = year;
        }

        public long getTotalStudents() {
            return totalStudents;
        }

        public void setTotalStudents(long totalStudents) {
            this.totalStudents = totalStudents;
        }
    }

    public static class RecentSchool {
        private String id;
        private String name;
        private String city;
        private int students;
        private String status;
        private String date;

        public RecentSchool() {
        }

        public RecentSchool(String id, String name, String city, int students, String status, String date) {
            this.id = id;
            this.name = name;
            this.city = city;
            this.students = students;
            this.status = status;
            this.date = date;
        }

        // Getters/Setters omitted for brevity, assuming standard mapping.
        // Ideally should be generated. For simplicity in this tool usage, defining
        // public getters/setters.
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public int getStudents() {
            return students;
        }

        public void setStudents(int students) {
            this.students = students;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }
    }

    public static class ActiveAdmin {
        private String id;
        private String name;
        private String schoolName;
        private String lastLogin;
        private String initials;

        public ActiveAdmin() {
        }

        public ActiveAdmin(String id, String name, String schoolName, String lastLogin) {
            this.id = id;
            this.name = name;
            this.schoolName = schoolName;
            this.lastLogin = lastLogin;
            this.initials = (name != null && !name.isEmpty()) ? name.substring(0, 1).toUpperCase() : "A";
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getSchoolName() {
            return schoolName;
        }

        public void setSchoolName(String schoolName) {
            this.schoolName = schoolName;
        }

        public String getLastLogin() {
            return lastLogin;
        }

        public void setLastLogin(String lastLogin) {
            this.lastLogin = lastLogin;
        }

        public String getInitials() {
            return initials;
        }

        public void setInitials(String initials) {
            this.initials = initials;
        }
    }

    public static class SystemAlert {
        private String id;
        private String title;
        private String message;
        private String time;
        private String type; // warning, error, info

        public SystemAlert() {
        }

        public SystemAlert(String id, String title, String message, String time, String type) {
            this.id = id;
            this.title = title;
            this.message = message;
            this.time = time;
            this.type = type;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    public static class PendingAction {
        private String id;
        private String title;
        private String description;
        private String date;
        private String priority; // High, Medium, Low

        public PendingAction() {
        }

        public PendingAction(String id, String title, String description, String date, String priority) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.date = date;
            this.priority = priority;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }
    }

    // Getters and Setters for lists
    public List<StudentGrowthYearly> getStudentGrowth() {
        return studentGrowth;
    }

    public void setStudentGrowth(List<StudentGrowthYearly> studentGrowth) {
        this.studentGrowth = studentGrowth;
    }

    public List<RecentSchool> getRecentSchools() {
        return recentSchools;
    }

    public void setRecentSchools(List<RecentSchool> recentSchools) {
        this.recentSchools = recentSchools;
    }

    public List<ActiveAdmin> getActiveAdmins() {
        return activeAdmins;
    }

    public void setActiveAdmins(List<ActiveAdmin> activeAdmins) {
        this.activeAdmins = activeAdmins;
    }

    public List<SystemAlert> getSystemAlerts() {
        return systemAlerts;
    }

    public void setSystemAlerts(List<SystemAlert> systemAlerts) {
        this.systemAlerts = systemAlerts;
    }

    public List<PendingAction> getPendingActions() {
        return pendingActions;
    }

    public void setPendingActions(List<PendingAction> pendingActions) {
        this.pendingActions = pendingActions;
    }

    public long getTotalSchools() {
        return totalSchools;
    }

    public void setTotalSchools(long totalSchools) {
        this.totalSchools = totalSchools;
    }

    public long getActiveSchools() {
        return activeSchools;
    }

    public void setActiveSchools(long activeSchools) {
        this.activeSchools = activeSchools;
    }

    public long getInactiveSchools() {
        return inactiveSchools;
    }

    public void setInactiveSchools(long inactiveSchools) {
        this.inactiveSchools = inactiveSchools;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalTeachers() {
        return totalTeachers;
    }

    public void setTotalTeachers(long totalTeachers) {
        this.totalTeachers = totalTeachers;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getTotalParents() {
        return totalParents;
    }

    public void setTotalParents(long totalParents) {
        this.totalParents = totalParents;
    }

    public List<AttendanceTrend> getAttendanceTrend() {
        return attendanceTrend;
    }

    public void setAttendanceTrend(List<AttendanceTrend> attendanceTrend) {
        this.attendanceTrend = attendanceTrend;
    }

    public List<SchoolGrowth> getSchoolGrowth() {
        return schoolGrowth;
    }

    public void setSchoolGrowth(List<SchoolGrowth> schoolGrowth) {
        this.schoolGrowth = schoolGrowth;
    }

    public Map<String, Long> getStudentDistribution() {
        return studentDistribution;
    }

    public void setStudentDistribution(Map<String, Long> studentDistribution) {
        this.studentDistribution = studentDistribution;
    }
}
