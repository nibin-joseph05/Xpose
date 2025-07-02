package com.crimereport.xpose.events;

import com.crimereport.xpose.models.Notification;
import com.crimereport.xpose.models.User;
import org.springframework.context.ApplicationEvent;

public class NotificationEvent extends ApplicationEvent {

    private final User recipient;
    private final Notification.NotificationType type;
    private final String title;
    private final String message;

    public NotificationEvent(Object source, User recipient, Notification.NotificationType type, String title, String message) {
        super(source);
        this.recipient = recipient;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    public User getRecipient() {
        return recipient;
    }

    public Notification.NotificationType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }
}