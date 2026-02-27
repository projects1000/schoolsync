package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "subjects")
@CompoundIndex(name = "school_subject_name_idx", def = "{'schoolId': 1, 'name': 1}", unique = true)
public class Subject {

    @Id
    private String id;

    private String schoolId;

    private String name;

    private String code;

    private String description;

    private boolean active = true;

    public enum SubjectType {
        UNIVERSAL, CLASS_SPECIFIC
    }

    private SubjectType type = SubjectType.UNIVERSAL;

    private String targetGrade;

    private List<String> excludedGrades = new java.util.ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    public Subject() {
    }

    public Subject(String schoolId, String name, String description) {
        this.schoolId = schoolId;
        this.name = name;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public SubjectType getType() {
        return type;
    }

    public void setType(SubjectType type) {
        this.type = type;
    }

    public String getTargetGrade() {
        return targetGrade;
    }

    public void setTargetGrade(String targetGrade) {
        this.targetGrade = targetGrade;
    }

    public List<String> getExcludedGrades() {
        return excludedGrades;
    }

    public void setExcludedGrades(List<String> excludedGrades) {
        this.excludedGrades = excludedGrades;
    }
}
