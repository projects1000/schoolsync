package com.littlesteps.playschool.dto;

import java.time.LocalDateTime;

public class ParentRegistrationResponse {
    private String id;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String studentName;
    private String studentClass;
    private String registrationCode;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime usedAt;
    private String createdBy;
    private String schoolId;

    public ParentRegistrationResponse() {
    }

    public ParentRegistrationResponse(String id, String parentName, String parentEmail, String parentPhone,
            String studentName, String studentClass, String registrationCode, String status, LocalDateTime createdAt,
            LocalDateTime usedAt, String createdBy, String schoolId) {
        this.id = id;
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.parentPhone = parentPhone;
        this.studentName = studentName;
        this.studentClass = studentClass;
        this.registrationCode = registrationCode;
        this.status = status;
        this.createdAt = createdAt;
        this.usedAt = usedAt;
        this.createdBy = createdBy;
        this.schoolId = schoolId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentEmail() {
        return parentEmail;
    }

    public void setParentEmail(String parentEmail) {
        this.parentEmail = parentEmail;
    }

    public String getParentPhone() {
        return parentPhone;
    }

    public void setParentPhone(String parentPhone) {
        this.parentPhone = parentPhone;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentClass() {
        return studentClass;
    }

    public void setStudentClass(String studentClass) {
        this.studentClass = studentClass;
    }

    public String getRegistrationCode() {
        return registrationCode;
    }

    public void setRegistrationCode(String registrationCode) {
        this.registrationCode = registrationCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }
}