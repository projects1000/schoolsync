package com.littlesteps.playschool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

public class TeacherDTO {
    private String id;
    private String employeeId;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String qualification;
    private String experience;
    private java.util.List<String> assignedClasses;
    private String status;
    private java.util.List<String> subjects;
    private String address;
    private String employmentType;
    private LocalDate joiningDate;

    public TeacherDTO() {
    }

    public TeacherDTO(String id, String employeeId, String name, String email, String phone, String department,
            String qualification, String experience, java.util.List<String> assignedClasses, String status,
            java.util.List<String> subjects, String address, String employmentType, LocalDate joiningDate) {
        this.id = id;
        this.employeeId = employeeId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.qualification = qualification;
        this.experience = experience;
        this.assignedClasses = assignedClasses;
        this.status = status;
        this.subjects = subjects;
        this.address = address;
        this.employmentType = employmentType;
        this.joiningDate = joiningDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

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

    public java.util.List<String> getAssignedClasses() {
        return assignedClasses;
    }

    public void setAssignedClasses(java.util.List<String> assignedClasses) {
        this.assignedClasses = assignedClasses;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.util.List<String> getSubjects() {
        return subjects;
    }

    public void setSubjects(java.util.List<String> subjects) {
        this.subjects = subjects;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }
}