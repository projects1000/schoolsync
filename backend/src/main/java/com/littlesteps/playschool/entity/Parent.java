package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "parents")
public class Parent {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    @Indexed
    private String schoolId;

    // Reference to user collection (no @DBRef, use ID reference instead)
    @Indexed
    private String userId;

    private String phoneNumber;
    private String address;
    private String occupation;

    private RelationType relation = RelationType.FATHER;

    // Removed @DBRef List<Student> children - now using parent_student_map
    // collection
    // Use ParentStudentMapRepository to query children

    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;

    private Status status = Status.ACTIVE;

    private String createdBy; // Admin ID who created this parent

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum RelationType {
        FATHER, MOTHER, GUARDIAN, GRANDFATHER, GRANDMOTHER, UNCLE, AUNT, OTHER
    }

    public enum Status {
        ACTIVE, INACTIVE, SUSPENDED
    }

    // Constructors
    public Parent() {
    }

    public Parent(String name, String email, String phoneNumber, RelationType relation) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.relation = relation;
    }

    // Getters and Setters
    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public RelationType getRelation() {
        return relation;
    }

    public void setRelation(RelationType relation) {
        this.relation = relation;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public String getEmergencyContactRelation() {
        return emergencyContactRelation;
    }

    public void setEmergencyContactRelation(String emergencyContactRelation) {
        this.emergencyContactRelation = emergencyContactRelation;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
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
}