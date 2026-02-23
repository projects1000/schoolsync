package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "schools")
public class School {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private String name;

    private String adminId;

    private String address;
    private String city;
    private String state;
    private String pincode;

    private String phone;
    private String email;
    private String timings;
    private String logo;

    private String principalName;
    private String principalEmail;

    private Status status = Status.ACTIVE;

    private LocalDateTime establishedDate;
    private LocalDateTime trialStartDate;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Status {
        ACTIVE, INACTIVE, SUSPENDED, TRIAL
    }

    // Constructors
    public School() {
    }

    public School(String code, String name, String address, String city, String state,
            String phone, String email) {
        this.code = code;
        this.name = name;
        this.address = address;
        this.city = city;
        this.state = state;
        this.phone = phone;
        this.email = email;
        this.status = Status.ACTIVE;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPrincipalName() {
        return principalName;
    }

    public void setPrincipalName(String principalName) {
        this.principalName = principalName;
    }

    public String getPrincipalEmail() {
        return principalEmail;
    }

    public void setPrincipalEmail(String principalEmail) {
        this.principalEmail = principalEmail;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getEstablishedDate() {
        return establishedDate;
    }

    public void setEstablishedDate(LocalDateTime establishedDate) {
        this.establishedDate = establishedDate;
    }

    public LocalDateTime getTrialStartDate() {
        return trialStartDate;
    }

    public void setTrialStartDate(LocalDateTime trialStartDate) {
        this.trialStartDate = trialStartDate;
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

    public String getTimings() {
        return timings;
    }

    public void setTimings(String timings) {
        this.timings = timings;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }
}
