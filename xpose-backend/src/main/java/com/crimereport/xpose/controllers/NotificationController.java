package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.Notification;
import com.crimereport.xpose.models.User;
import com.crimereport.xpose.services.AuthService;
import com.crimereport.xpose.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getNotificationsForUser(@PathVariable Long userId) {
        Optional<User> userOptional = authService.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        List<Notification> notifications = notificationService.getNotificationsForUser(userOptional.get());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnreadNotificationsForUser(@PathVariable Long userId) {
        Optional<User> userOptional = authService.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        List<Notification> notifications = notificationService.getUnreadNotificationsForUser(userOptional.get());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long notificationId) {
        Notification updatedNotification = notificationService.markNotificationAsRead(notificationId);
        if (updatedNotification == null) {
            return ResponseEntity.status(404).body("Notification not found");
        }
        return ResponseEntity.ok(updatedNotification);
    }
}