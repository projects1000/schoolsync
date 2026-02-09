package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDateTime;

@Document(collection = "classes")
@CompoundIndex(name = "school_grade_section_idx", def = "{'schoolId': 1, 'grade': 1, 'section': 1}", unique = true)
public class Classes {

    @Id
    private String id;

    private String name; // e.g., "Playgroup A", "Nursery B"

    private String grade; // e.g., "Playgroup", "Nursery", "Kindergarten"

    private String section; // e.g., "A", "B", "C"

    private String classTeacherId;

    private Integer capacity; // Maximum number of students

    private String room; // Room number or name

    private Boolean locked = false;

    private String schoolId;

    private Status status = Status.ACTIVE;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Status {
        ACTIVE, INACTIVE, ARCHIVED
    }

    // Constructors
    public Classes() {
    }

    public Classes(String name, String grade, String section, Integer capacity, String room) {
        this.name = name;
        this.grade = grade;
        this.section = section;
        this.capacity = capacity;
        this.room = room;
        this.status = Status.ACTIVE;
    }

    // Getters and Setters
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

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getClassTeacherId() {
        return classTeacherId;
    }

    public void setClassTeacherId(String classTeacherId) {
        this.classTeacherId = classTeacherId;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
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

    public Boolean getLocked() {
        return locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }
}