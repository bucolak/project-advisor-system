package com.example.demo.entity;

import java.time.LocalDateTime;

import com.example.demo.enums.ApplicationStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_applications")
public class ProjectApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    private LocalDateTime appliedAt = LocalDateTime.now();

    public ProjectApplication() {
    }

    public static ProjectApplicationBuilder builder() {
        return new ProjectApplicationBuilder();
    }

    public static class ProjectApplicationBuilder {

        private Project project;
        private Student student;
        private ApplicationStatus status = ApplicationStatus.PENDING;

        public ProjectApplicationBuilder project(Project v) {
            this.project = v;
            return this;
        }

        public ProjectApplicationBuilder student(Student v) {
            this.student = v;
            return this;
        }

        public ProjectApplicationBuilder status(ApplicationStatus v) {
            this.status = v;
            return this;
        }

        public ProjectApplication build() {
            ProjectApplication a = new ProjectApplication();
            a.project = this.project;
            a.student = this.student;
            a.status = this.status;
            return a;
        }
    }

    public Long getId() {
        return id;
    }

    public Project getProject() {
        return project;
    }

    public Student getStudent() {
        return student;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
}
