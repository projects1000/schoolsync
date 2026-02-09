package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    @DBRef
    private User actorUser; // Who performed the action

    private String action; // CREATE, UPDATE, DELETE, LOGIN, etc.

    private String targetType; // USER, TEACHER, STUDENT, PARENT, etc.

    private String targetId; // ID of the target entity

    private String payload; // JSON string with details of the change

    private String ipAddress; // IP address of the actor

    private String userAgent; // User agent string

    private LocalDateTime createdAt = LocalDateTime.now();

    private String description; // Human-readable description of the action

    private String schoolId;

    // Roll Number Recalculation Fields
    private String classId;
    private String sectionId;
    private java.util.List<String> affectedStudentIds;

    // Academic Assignment Fields
    private String subjectId;
    private String teacherId;

    // Constructors
    public AuditLog() {
    }

    public AuditLog(User actorUser, String action, String targetType, String targetId, String payload,
            String schoolId) {
        this.actorUser = actorUser;
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.payload = payload;
        this.schoolId = schoolId;
    }

    public AuditLog(User actorUser, String action, String targetType, String targetId,
            String payload, String description, String schoolId) {
        this.actorUser = actorUser;
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.payload = payload;
        this.description = description;
        this.schoolId = schoolId;
    }

    // Getters and Setters
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

    public User getActorUser() {
        return actorUser;
    }

    public void setActorUser(User actorUser) {
        this.actorUser = actorUser;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public java.util.List<String> getAffectedStudentIds() {
        return affectedStudentIds;
    }

    public void setAffectedStudentIds(java.util.List<String> affectedStudentIds) {
        this.affectedStudentIds = affectedStudentIds;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }
}