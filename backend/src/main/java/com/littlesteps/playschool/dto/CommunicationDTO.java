package com.littlesteps.playschool.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class CommunicationDTO {
    
    private Long id;
    private String subject;
    private String body;
    private String type; // INDIVIDUAL, BROADCAST, ANNOUNCEMENT, ALERT, REMINDER
    private Long senderId;
    private String senderName;
    private String senderRole; // ADMIN, TEACHER, PARENT, SYSTEM
    private List<Long> recipientIds;
    private List<String> recipientNames;
    private Set<Long> readBy;
    private Boolean isUrgent = false;
    private String className;
    private LocalDateTime createdAt;

    // Constructors
    public CommunicationDTO() {}

    public CommunicationDTO(String subject, String body, String type, Long senderId, 
                           String senderName, String senderRole) {
        this.subject = subject;
        this.body = body;
        this.type = type;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public List<Long> getRecipientIds() { return recipientIds; }
    public void setRecipientIds(List<Long> recipientIds) { this.recipientIds = recipientIds; }

    public List<String> getRecipientNames() { return recipientNames; }
    public void setRecipientNames(List<String> recipientNames) { this.recipientNames = recipientNames; }

    public Set<Long> getReadBy() { return readBy; }
    public void setReadBy(Set<Long> readBy) { this.readBy = readBy; }

    public Boolean getIsUrgent() { return isUrgent; }
    public void setIsUrgent(Boolean isUrgent) { this.isUrgent = isUrgent; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}