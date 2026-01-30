package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "teachers")
public class Teacher {

    @Id
    private String id;

    @DBRef
    private User user;

    @Indexed(unique = true)
    private String employeeId;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String phone;
    private String department;
    private String qualification;
    private String experience;
    private java.util.List<String> assignedClasses;
    private java.util.List<String> subjects;
    private String address;
    private EmploymentType employmentType;
    private Status status = Status.ACTIVE;
    private LocalDate joiningDate;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Status {
        ACTIVE, INACTIVE, ON_LEAVE
    }

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT
    }

    private String schoolId;

    // Constructors
    public Teacher() {
    }

    public Teacher(String employeeId, String name, String email, String phone,
            String department, String qualification, String experience,
            java.util.List<String> assignedClasses, LocalDate joiningDate, String schoolId) {
        this.employeeId = employeeId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.qualification = qualification;
        this.experience = experience;
        this.assignedClasses = assignedClasses;
        this.joiningDate = joiningDate;
        this.schoolId = schoolId;
        this.status = Status.ACTIVE;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }
}