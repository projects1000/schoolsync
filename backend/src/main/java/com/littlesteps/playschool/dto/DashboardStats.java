package com.littlesteps.playschool.dto;

import java.util.List;
import java.util.Map;

public class DashboardStats {
    private long totalSchools;
    private long activeSchools;
    private long inactiveSchools;
    private long totalStudents;
    private long totalTeachers;

    // For charts
    private Map<String, Integer> studentDistribution;
    // Simple lists for now, can be complex objects later
    private List<Map<String, Object>> studentGrowth;
    private List<Map<String, Object>> recentSchools;
    private List<Map<String, Object>> activeAdmins;

    public DashboardStats() {
    }

    public DashboardStats(long totalSchools, long activeSchools, long inactiveSchools, long totalStudents,
            long totalTeachers) {
        this.totalSchools = totalSchools;
        this.activeSchools = activeSchools;
        this.inactiveSchools = inactiveSchools;
        this.totalStudents = totalStudents;
        this.totalTeachers = totalTeachers;
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

    public Map<String, Integer> getStudentDistribution() {
        return studentDistribution;
    }

    public void setStudentDistribution(Map<String, Integer> studentDistribution) {
        this.studentDistribution = studentDistribution;
    }

    public List<Map<String, Object>> getStudentGrowth() {
        return studentGrowth;
    }

    public void setStudentGrowth(List<Map<String, Object>> studentGrowth) {
        this.studentGrowth = studentGrowth;
    }

    public List<Map<String, Object>> getRecentSchools() {
        return recentSchools;
    }

    public void setRecentSchools(List<Map<String, Object>> recentSchools) {
        this.recentSchools = recentSchools;
    }

    public List<Map<String, Object>> getActiveAdmins() {
        return activeAdmins;
    }

    public void setActiveAdmins(List<Map<String, Object>> activeAdmins) {
        this.activeAdmins = activeAdmins;
    }
}
