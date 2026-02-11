package com.littlesteps.playschool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String recipientId; // User ID (Admin, Teacher, or Parent)
    private String title;
    private String message;
    private NotificationType type; // INFO, WARNING, SUCCESS, ERROR
    private boolean isRead;
    private LocalDateTime createdAt;

    public enum NotificationType {
        INFO, WARNING, SUCCESS, ERROR
    }
}
