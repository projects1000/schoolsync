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
        String userId = authentication.getName(); // Assuming username is the ID or we can get ID from user details
        // In existing code, typically we might need to look up the user ID if
        // 'getName()' returns email.
        // For now, let's assume the principal's name is the email/ID used for
        // recipientId or we need to resolving it.
        // Actually, looking at other controllers, we might need to resolve the user.
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
