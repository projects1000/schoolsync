package com.littlesteps.playschool.dto;

import com.littlesteps.playschool.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
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