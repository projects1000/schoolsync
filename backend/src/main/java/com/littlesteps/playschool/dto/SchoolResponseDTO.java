package com.littlesteps.playschool.dto;

import com.littlesteps.playschool.entity.School;
import java.util.Map;

public class SchoolResponseDTO extends School {

    private Map<String, String> admin;

    // Constructors
    public SchoolResponseDTO() {
        super();
    }

    public SchoolResponseDTO(School school) {
        this.setId(school.getId());
        this.setCode(school.getCode());
        this.setName(school.getName());
        this.setAddress(school.getAddress());
        this.setCity(school.getCity());
        this.setState(school.getState());
        this.setPincode(school.getPincode());
        this.setPhone(school.getPhone());
        this.setEmail(school.getEmail());
        this.setPrincipalName(school.getPrincipalName());
        this.setPrincipalEmail(school.getPrincipalEmail());
        this.setStatus(school.getStatus());
        this.setEstablishedDate(school.getEstablishedDate());
        this.setCreatedAt(school.getCreatedAt());
        this.setUpdatedAt(school.getUpdatedAt());
    }

    public Map<String, String> getAdmin() {
        return admin;
    }

    public void setAdmin(Map<String, String> admin) {
        this.admin = admin;
    }
}
