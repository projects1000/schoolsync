package com.littlesteps.playschool.dto;

import java.math.BigDecimal;
import java.util.List;

public class SchoolDetailsDto {

    private SchoolResponse school;
    private List<TeacherDTO> teachers;
    private List<StudentDTO> students;
    private long totalStudents;
    private long totalTeachers;
    private BigDecimal totalRevenue;
    private BigDecimal subscriptionDue;

    public SchoolDetailsDto() {
    }

    public SchoolResponse getSchool() {
        return school;
    }

    public void setSchool(SchoolResponse school) {
        this.school = school;
    }

    public List<TeacherDTO> getTeachers() {
        return teachers;
    }

    public void setTeachers(List<TeacherDTO> teachers) {
        this.teachers = teachers;
    }

    public List<StudentDTO> getStudents() {
        return students;
    }

    public void setStudents(List<StudentDTO> students) {
        this.students = students;
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

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getSubscriptionDue() {
        return subscriptionDue;
    }

    public void setSubscriptionDue(BigDecimal subscriptionDue) {
        this.subscriptionDue = subscriptionDue;
    }
}
