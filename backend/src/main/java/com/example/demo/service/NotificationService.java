package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(User user, String message) {
        Notification notification = Notification.builder()
                .user(user).message(message).isRead(false).build();
        notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Notification markAsRead(Long userId, Long notificationId) {
    Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Notification not found."
            ));

    if (!notification.getUser().getId().equals(userId)) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "This notification does not belong to you."
        );
    }

    notification.setIsRead(true);

    return notificationRepository.save(notification);
}
}
