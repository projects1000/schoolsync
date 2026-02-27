package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "communications")
public class Communication {

    @Id
    private String id;

    private String subject;

    private String body;

    private MessageType type;

    private String senderId;

    private String senderName;

    private SenderRole senderRole;

    private Set<String> recipientIds = new HashSet<>();

    private Set<String> recipientNames = new HashSet<>();

    private Set<String> readBy = new HashSet<>();

    private Boolean isUrgent = false;

    private String className; // For class-wide communications

    private String targetClassId;

    private String targetStudentId;

    private String schoolId;

    private RecipientType recipientType;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum MessageType {
        INDIVIDUAL, BROADCAST, ANNOUNCEMENT, ALERT, REMINDER
    }

    public enum RecipientType {
        TEACHER, PARENT, ALL_TEACHERS, CLASS_PARENTS, ALL_PARENTS
    }

    public enum SenderRole {
        ADMIN, TEACHER, PARENT, SYSTEM
    }

    // Constructors
    public Communication() {
    }

    public Communication(String subject, String body, MessageType type, String senderId,
            String senderName, SenderRole senderRole, String schoolId) {
        this.subject = subject;
        this.body = body;
        this.type = type;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.schoolId = schoolId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public SenderRole getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(SenderRole senderRole) {
        this.senderRole = senderRole;
    }

    public Set<String> getRecipientIds() {
        return recipientIds;
    }

    public void setRecipientIds(Set<String> recipientIds) {
        this.recipientIds = recipientIds;
    }

    public Set<String> getRecipientNames() {
        return recipientNames;
    }

    public void setRecipientNames(Set<String> recipientNames) {
        this.recipientNames = recipientNames;
    }

    public Set<String> getReadBy() {
        return readBy;
    }

    public void setReadBy(Set<String> readBy) {
        this.readBy = readBy;
    }

    public Boolean getIsUrgent() {
        return isUrgent;
    }

    public void setIsUrgent(Boolean isUrgent) {
        this.isUrgent = isUrgent;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
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

    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }

    public RecipientType getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(RecipientType recipientType) {
        this.recipientType = recipientType;
    }

    public String getTargetClassId() {
        return targetClassId;
    }

    public void setTargetClassId(String targetClassId) {
        this.targetClassId = targetClassId;
    }

    public String getTargetStudentId() {
        return targetStudentId;
    }

    public void setTargetStudentId(String targetStudentId) {
        this.targetStudentId = targetStudentId;
    }

    // Helper methods
    public void addRecipient(String recipientId, String recipientName) {
        this.recipientIds.add(recipientId);
        this.recipientNames.add(recipientName);
    }

    public void markAsReadBy(String userId) {
        this.readBy.add(userId);
    }

    public boolean isReadBy(String userId) {
        return this.readBy.contains(userId);
    }
}