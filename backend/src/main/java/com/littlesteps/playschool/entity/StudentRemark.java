package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "student_remarks")
public class StudentRemark {

    @Id
    private String id;

    private String studentId;
    private String teacherId;
    private String title;
    private String description;

    private RemarkType type;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RemarkType {
        GENERAL,
        POSITIVE,
        DISCIPLINE,
        IMPROVEMENT
    }

    // Constructors
    public StudentRemark() {
    }

    public StudentRemark(String studentId, String teacherId, String title, String description, RemarkType type) {
        this.studentId = studentId;
        this.teacherId = teacherId;
        this.title = title;
        this.description = description;
        this.type = type;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RemarkType getType() {
        return type;
    }

    public void setType(RemarkType type) {
        this.type = type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
