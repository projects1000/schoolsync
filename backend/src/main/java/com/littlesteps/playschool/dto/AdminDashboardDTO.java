package com.littlesteps.playschool.dto;

import com.littlesteps.playschool.entity.AuditLog;
import java.math.BigDecimal;
import java.util.List;

public class AdminDashboardDTO {
    private long totalStudents;
    private long totalTeachers;
    private double attendancePercentage;
    private BigDecimal pendingFees;
    private List<AuditLog> recentActivities;

    public AdminDashboardDTO() {
    }

    public AdminDashboardDTO(long totalStudents, long totalTeachers, double attendancePercentage,
            BigDecimal pendingFees, List<AuditLog> recentActivities) {
        this.totalStudents = totalStudents;
        this.totalTeachers = totalTeachers;
        this.attendancePercentage = attendancePercentage;
        this.pendingFees = pendingFees;
        this.recentActivities = recentActivities;
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

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public BigDecimal getPendingFees() {
        return pendingFees;
    }

    public void setPendingFees(BigDecimal pendingFees) {
        this.pendingFees = pendingFees;
    }

    public List<AuditLog> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<AuditLog> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
