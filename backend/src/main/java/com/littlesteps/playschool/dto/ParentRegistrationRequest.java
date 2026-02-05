package com.littlesteps.playschool.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ParentRegistrationRequest {

    @NotBlank(message = "Parent name is required")
    private String parentName;

    @Email(message = "Please provide a valid email address")
    @NotBlank(message = "Parent email is required")
    private String parentEmail;

    @NotBlank(message = "Parent phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String parentPhone;

    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotBlank(message = "Student class is required")
    private String studentClass;

    public ParentRegistrationRequest() {
    }

    public ParentRegistrationRequest(String parentName, String parentEmail, String parentPhone, String studentName,
            String studentClass) {
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.parentPhone = parentPhone;
        this.studentName = studentName;
        this.studentClass = studentClass;
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
}