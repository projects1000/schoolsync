package com.littlesteps.playschool.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private String confirmPassword;
    private String role;
    private String registrationCode; // For parent registration

    // Constructors
    public RegisterRequest() {}

    public RegisterRequest(String name, String email, String phone, String password, String confirmPassword, String role, String registrationCode) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.role = role;
        this.registrationCode = registrationCode;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRegistrationCode() { return registrationCode; }
    public void setRegistrationCode(String registrationCode) { this.registrationCode = registrationCode; }
}