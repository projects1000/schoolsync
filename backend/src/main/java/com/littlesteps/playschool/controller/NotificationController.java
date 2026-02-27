package com.littlesteps.playschool.controller;

import com.littlesteps.playschool.entity.Notification;
import com.littlesteps.playschool.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PostMapping
    public ResponseEntity<Notification> sendNotification(@RequestBody Map<String, String> payload) {
        // Admin only - ideally securoty check
        String recipientId = payload.get("recipientId");
        String title = payload.get("title");
        String message = payload.get("message");
        Notification.NotificationType type = Notification.NotificationType.valueOf(payload.get("type"));

        return ResponseEntity.ok(notificationService.createNotification(recipientId, title, message, type));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
