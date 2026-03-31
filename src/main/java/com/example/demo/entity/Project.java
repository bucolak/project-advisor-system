package com.example.demo.entity;

import com.example.demo.enums.ProjectStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String requiredSkills;
    private Integer teamSize;
    private String rolesNeeded;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private ProjectCategory category;
    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.OPEN;
    private Boolean isDeleted = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Project() {}

    public static ProjectBuilder builder() { return new ProjectBuilder(); }

    public static class ProjectBuilder {
        private Student student;
        private String title, description, requiredSkills, rolesNeeded;
        private Integer teamSize;
        private ProjectCategory category;
        private ProjectStatus status = ProjectStatus.OPEN;
        private Boolean isDeleted = false;
        public ProjectBuilder student(Student v) { this.student = v; return this; }
        public ProjectBuilder title(String v) { this.title = v; return this; }
        public ProjectBuilder description(String v) { this.description = v; return this; }
        public ProjectBuilder requiredSkills(String v) { this.requiredSkills = v; return this; }
        public ProjectBuilder rolesNeeded(String v) { this.rolesNeeded = v; return this; }
        public ProjectBuilder teamSize(Integer v) { this.teamSize = v; return this; }
        public ProjectBuilder category(ProjectCategory v) { this.category = v; return this; }
        public ProjectBuilder status(ProjectStatus v) { this.status = v; return this; }
        public ProjectBuilder isDeleted(Boolean v) { this.isDeleted = v; return this; }
        public Project build() {
            Project p = new Project();
            p.student = this.student; p.title = this.title; p.description = this.description;
            p.requiredSkills = this.requiredSkills; p.rolesNeeded = this.rolesNeeded;
            p.teamSize = this.teamSize; p.category = this.category;
            p.status = this.status; p.isDeleted = this.isDeleted;
            return p;
        }
    }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getRequiredSkills() { return requiredSkills; }
    public Integer getTeamSize() { return teamSize; }
    public String getRolesNeeded() { return rolesNeeded; }
    public ProjectCategory getCategory() { return category; }
    public ProjectStatus getStatus() { return status; }
    public Boolean getIsDeleted() { return isDeleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setStatus(ProjectStatus v) { this.status = v; }
    public void setIsDeleted(Boolean v) { this.isDeleted = v; }
    public void setTitle(String v) { this.title = v; }
    public void setDescription(String v) { this.description = v; }
}
