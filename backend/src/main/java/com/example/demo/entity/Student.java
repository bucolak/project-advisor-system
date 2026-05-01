package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student {
    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String department;
    private Integer year;
    private Double gpa;
    private String skills;
    private String githubLink;
    private String linkedinLink;

    public Student() {}

    public static StudentBuilder builder() {
        return new StudentBuilder();
    }

    public static class StudentBuilder {
        private User user;
        private String department;
        private Integer year;
        private Double gpa;
        private String skills;
        private String githubLink;
        private String linkedinLink;

        public StudentBuilder user(User v) {
            this.user = v;
            return this;
        }

        public StudentBuilder department(String v) {
            this.department = v;
            return this;
        }

        public StudentBuilder year(Integer v) {
            this.year = v;
            return this;
        }

        public StudentBuilder gpa(Double v) {
            this.gpa = v;
            return this;
        }

        public StudentBuilder skills(String v) {
            this.skills = v;
            return this;
        }

        public StudentBuilder githubLink(String v) {
            this.githubLink = v;
            return this;
        }

        public StudentBuilder linkedinLink(String v) {
            this.linkedinLink = v;
            return this;
        }

        public Student build() {
            Student s = new Student();
            s.user = this.user;
            s.department = this.department;
            s.year = this.year;
            s.gpa = this.gpa;
            s.skills = this.skills;
            s.githubLink = this.githubLink;
            s.linkedinLink = this.linkedinLink;
            return s;
        }
    }

    public Long getUserId() {
        return userId;
    }

    public User getUser() {
        return user;
    }

    public String getDepartment() {
        return department;
    }

    public Integer getYear() {
        return year;
    }

    public Double getGpa() {
        return gpa;
    }

    public String getSkills() {
        return skills;
    }

    public String getGithubLink() {
        return githubLink;
    }

    public String getLinkedinLink() {
        return linkedinLink;
    }

    public void setUser(User v) {
        this.user = v;
    }

    public void setDepartment(String v) {
        this.department = v;
    }

    public void setYear(Integer v) {
        this.year = v;
    }

    public void setGpa(Double v) {
        this.gpa = v;
    }

    public void setSkills(String v) {
        this.skills = v;
    }

    public void setGithubLink(String v) {
        this.githubLink = v;
    }

    public void setLinkedinLink(String v) {
        this.linkedinLink = v;
    }
}