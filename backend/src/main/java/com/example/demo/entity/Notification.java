package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    private String message;
    private Boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public static NotificationBuilder builder() { return new NotificationBuilder(); }

    public static class NotificationBuilder {
        private User user;
        private String message;
        private Boolean isRead = false;
        public NotificationBuilder user(User v) { this.user = v; return this; }
        public NotificationBuilder message(String v) { this.message = v; return this; }
        public NotificationBuilder isRead(Boolean v) { this.isRead = v; return this; }
        public Notification build() {
            Notification n = new Notification();
            n.user = this.user; n.message = this.message; n.isRead = this.isRead;
            return n;
        }
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getMessage() { return message; }
    public Boolean getIsRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setIsRead(Boolean v) { this.isRead = v; }
}
