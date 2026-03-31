package com.example.demo.entity;

import com.example.demo.enums.AdvisingStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "advisors")
public class Advisor {
    @Id
    private Long userId;
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    private String title;
    private String department;
    private String areasOfExpertise;
    private Integer currentQuota = 0;
    private Integer maxQuota = 5;
    @Enumerated(EnumType.STRING)
    private AdvisingStatus advisingStatus = AdvisingStatus.ACTIVE;

    public Advisor() {}

    public static AdvisorBuilder builder() { return new AdvisorBuilder(); }

    public static class AdvisorBuilder {
        private User user;
        private String title, department, areasOfExpertise;
        private Integer currentQuota = 0, maxQuota = 5;
        private AdvisingStatus advisingStatus = AdvisingStatus.ACTIVE;
        public AdvisorBuilder user(User v) { this.user = v; return this; }
        public AdvisorBuilder title(String v) { this.title = v; return this; }
        public AdvisorBuilder department(String v) { this.department = v; return this; }
        public AdvisorBuilder areasOfExpertise(String v) { this.areasOfExpertise = v; return this; }
        public AdvisorBuilder currentQuota(Integer v) { this.currentQuota = v; return this; }
        public AdvisorBuilder maxQuota(Integer v) { this.maxQuota = v; return this; }
        public AdvisorBuilder advisingStatus(AdvisingStatus v) { this.advisingStatus = v; return this; }
        public Advisor build() {
            Advisor a = new Advisor();
            a.user = this.user; a.title = this.title; a.department = this.department;
            a.areasOfExpertise = this.areasOfExpertise; a.currentQuota = this.currentQuota;
            a.maxQuota = this.maxQuota; a.advisingStatus = this.advisingStatus;
            return a;
        }
    }

    public Long getUserId() { return userId; }
    public User getUser() { return user; }
    public String getTitle() { return title; }
    public String getDepartment() { return department; }
    public String getAreasOfExpertise() { return areasOfExpertise; }
    public Integer getCurrentQuota() { return currentQuota; }
    public Integer getMaxQuota() { return maxQuota; }
    public AdvisingStatus getAdvisingStatus() { return advisingStatus; }
    public void setCurrentQuota(Integer v) { this.currentQuota = v; }
    public void setMaxQuota(Integer v) { this.maxQuota = v; }
    public void setAdvisingStatus(AdvisingStatus v) { this.advisingStatus = v; }
    public void setTitle(String v) { this.title = v; }
    public void setDepartment(String v) { this.department = v; }
    public void setAreasOfExpertise(String v) { this.areasOfExpertise = v; }
}
