package com.littlesteps.playschool.dto;

import java.util.List;
import java.util.Map;

public class TeacherDashboardDTO {
    private String teacherName;
    private String email;
    private String department;
    private String schoolName;
    private int assignedClassesCount;
    private List<Map<String, String>> assignedClasses; // List of map with "id", "name", "grade", "section"

    public TeacherDashboardDTO() {
    }

    public TeacherDashboardDTO(String teacherName, String email, String department, String schoolName,
            int assignedClassesCount, List<Map<String, String>> assignedClasses) {
        this.teacherName = teacherName;
        this.email = email;
        this.department = department;
        this.schoolName = schoolName;
        this.assignedClassesCount = assignedClassesCount;
        this.assignedClasses = assignedClasses;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public int getAssignedClassesCount() {
        return assignedClassesCount;
    }

    public void setAssignedClassesCount(int assignedClassesCount) {
        this.assignedClassesCount = assignedClassesCount;
    }

    public List<Map<String, String>> getAssignedClasses() {
        return assignedClasses;
    }

    public void setAssignedClasses(List<Map<String, String>> assignedClasses) {
        this.assignedClasses = assignedClasses;
    }
}
