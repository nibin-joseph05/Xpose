package com.crimereport.xpose.repository;

import com.crimereport.xpose.models.Notification;
import com.crimereport.xpose.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);
}