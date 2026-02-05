package com.littlesteps.playschool.dto;

import com.littlesteps.playschool.entity.School;
import java.time.LocalDateTime;

public class SchoolResponse {
    private String id;
    private String code;
    private String name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String email;
    private String timings;
    private String logo;
    private School.Status status;
    private LocalDateTime establishedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private AdminSummary admin;
    private int students;
    private int teachers;

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

    public School.Status getStatus() {
        return status;
    }

    public void setStatus(School.Status status) {
        this.status = status;
    }

    public LocalDateTime getEstablishedDate() {
        return establishedDate;
    }

    public void setEstablishedDate(LocalDateTime establishedDate) {
        this.establishedDate = establishedDate;
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

    public AdminSummary getAdmin() {
        return admin;
    }

    public void setAdmin(AdminSummary admin) {
        this.admin = admin;
    }

    public int getStudents() {
        return students;
    }

    public void setStudents(int students) {
        this.students = students;
    }

    public int getTeachers() {
        return teachers;
    }

    public void setTeachers(int teachers) {
        this.teachers = teachers;
    }

    public static SchoolResponse fromEntity(School school, AdminSummary admin, int studentCount, int teacherCount) {
        SchoolResponse response = new SchoolResponse();
        response.setId(school.getId());
        response.setCode(school.getCode());
        response.setName(school.getName());
        response.setAddress(school.getAddress());
        response.setCity(school.getCity());
        response.setState(school.getState());
        response.setPincode(school.getPincode());
        response.setPhone(school.getPhone());
        response.setEmail(school.getEmail());
        response.setTimings(school.getTimings());
        response.setLogo(school.getLogo());
        response.setStatus(school.getStatus());
        response.setEstablishedDate(school.getEstablishedDate());
        response.setCreatedAt(school.getCreatedAt());
        response.setUpdatedAt(school.getUpdatedAt());
        response.setAdmin(admin);
        response.setStudents(studentCount);
        response.setTeachers(teacherCount);
        return response;
    }
}
