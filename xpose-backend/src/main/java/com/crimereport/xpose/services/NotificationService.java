package com.crimereport.xpose.services;

import com.crimereport.xpose.models.Notification;
import com.crimereport.xpose.models.User;
import com.crimereport.xpose.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification saveNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotificationsForUser(User user) {
        return notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    public Optional<Notification> getNotificationById(Long notificationId) {
        return notificationRepository.findById(notificationId);
    }

    public Notification markNotificationAsRead(Long notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        return null;
    }
}