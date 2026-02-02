package com.littlesteps.playschool.dto;

import com.littlesteps.playschool.entity.School;
import lombok.Data;

import java.time.LocalDateTime;

@Data
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
    private int students; // Frontend seems to expect this too
    private int teachers; // Frontend seems to expect this too

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
