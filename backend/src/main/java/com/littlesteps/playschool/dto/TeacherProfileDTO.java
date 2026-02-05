package com.littlesteps.playschool.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class TeacherProfileDTO {
    private String name;
    private String email;
    private String employeeId;
    private String phone;
    private String department;
    private String qualification;
    private String experience;
    private LocalDate joiningDate;
    private String schoolName;
    private List<Map<String, String>> assignedClasses; // List of {id, name, grade, section}

    public TeacherProfileDTO(String name, String email, String employeeId, String phone, String department,
            String qualification, String experience, LocalDate joiningDate, String schoolName,
            List<Map<String, String>> assignedClasses) {
        this.name = name;
        this.email = email;
        this.employeeId = employeeId;
        this.phone = phone;
        this.department = department;
        this.qualification = qualification;
        this.experience = experience;
        this.joiningDate = joiningDate;
        this.schoolName = schoolName;
        this.assignedClasses = assignedClasses;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public List<Map<String, String>> getAssignedClasses() {
        return assignedClasses;
    }

    public void setAssignedClasses(List<Map<String, String>> assignedClasses) {
        this.assignedClasses = assignedClasses;
    }
}
