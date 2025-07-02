package com.crimereport.xpose.listeners;

import com.crimereport.xpose.events.NotificationEvent;
import com.crimereport.xpose.models.Notification;
import com.crimereport.xpose.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    @Autowired
    private NotificationService notificationService;

    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        Notification notification = new Notification(
                event.getRecipient(),
                event.getType(),
                event.getTitle(),
                event.getMessage()
        );
        notificationService.saveNotification(notification);
    }
}