package com.littlesteps.playschool.dto;

import com.littlesteps.playschool.entity.User;
import java.time.LocalDateTime;

public class AdminResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private User.Role role;
    private User.Status status;
    private String schoolId;
    private String schoolName;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;

    public AdminResponse() {
    }

    public AdminResponse(String id, String name, String email, String phone, User.Role role, User.Status status,
            String schoolId, String schoolName, LocalDateTime lastLogin, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.status = status;
        this.schoolId = schoolId;
        this.schoolName = schoolName;
        this.lastLogin = lastLogin;
        this.createdAt = createdAt;
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

    public User.Role getRole() {
        return role;
    }

    public void setRole(User.Role role) {
        this.role = role;
    }

    public User.Status getStatus() {
        return status;
    }

    public void setStatus(User.Status status) {
        this.status = status;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static AdminResponse fromUser(User user, String schoolName) {
        AdminResponse response = new AdminResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setSchoolId(user.getSchoolId());
        response.setSchoolName(schoolName);
        response.setLastLogin(user.getLastLogin());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}