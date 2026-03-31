package com.example.demo.entity;

import com.example.demo.enums.AnnouncementTarget;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String content;
    @Enumerated(EnumType.STRING)
    private AnnouncementTarget targetRole;
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Announcement() {}

    public static AnnouncementBuilder builder() { return new AnnouncementBuilder(); }

    public static class AnnouncementBuilder {
        private String title, content;
        private AnnouncementTarget targetRole;
        private User createdBy;
        public AnnouncementBuilder title(String v) { this.title = v; return this; }
        public AnnouncementBuilder content(String v) { this.content = v; return this; }
        public AnnouncementBuilder targetRole(AnnouncementTarget v) { this.targetRole = v; return this; }
        public AnnouncementBuilder createdBy(User v) { this.createdBy = v; return this; }
        public Announcement build() {
            Announcement a = new Announcement();
            a.title = this.title; a.content = this.content;
            a.targetRole = this.targetRole; a.createdBy = this.createdBy;
            return a;
        }
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public AnnouncementTarget getTargetRole() { return targetRole; }
    public User getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setTitle(String v) { this.title = v; }
    public void setContent(String v) { this.content = v; }
}
