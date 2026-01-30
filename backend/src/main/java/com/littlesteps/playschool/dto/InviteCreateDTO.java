package com.littlesteps.playschool.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Data Transfer Object for creating invites
 */
public class InviteCreateDTO {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "TEACHER|PARENT", message = "Role must be either TEACHER or PARENT")
    private String role;
    
    // Constructors
    public InviteCreateDTO() {}
    
    public InviteCreateDTO(String email, String role) {
        this.email = email;
        this.role = role;
    }
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
}