package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "parent_student_map")
@CompoundIndex(name = "parent_student_unique", def = "{'parentId': 1, 'studentId': 1}", unique = true)
public class ParentStudentMap {

    @Id
    private String id;

    @Indexed
    private String parentId;

    @Indexed
    private String studentId;

    @Indexed
    private String schoolId;

    private String relation; // Optional per-link relation override (FATHER, MOTHER, etc.)

    private LocalDateTime createdAt = LocalDateTime.now();

    private String createdBy; // Admin ID who created this mapping

    // Constructors
    public ParentStudentMap() {
    }

    public ParentStudentMap(String parentId, String studentId, String schoolId, String relation, String createdBy) {
        this.parentId = parentId;
        this.studentId = studentId;
        this.schoolId = schoolId;
        this.relation = relation;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
