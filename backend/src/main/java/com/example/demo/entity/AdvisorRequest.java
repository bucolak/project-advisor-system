package com.example.demo.entity;

import com.example.demo.enums.RequestStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "advisor_requests")
public class AdvisorRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    @ManyToOne
    @JoinColumn(name = "advisor_id", nullable = false)
    private Advisor advisor;
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;
    private LocalDateTime requestDate = LocalDateTime.now();
    private LocalDateTime responseDate;

    public AdvisorRequest() {}

    public static AdvisorRequestBuilder builder() { return new AdvisorRequestBuilder(); }

    public static class AdvisorRequestBuilder {
        private Project project;
        private Advisor advisor;
        private RequestStatus status = RequestStatus.PENDING;
        public AdvisorRequestBuilder project(Project v) { this.project = v; return this; }
        public AdvisorRequestBuilder advisor(Advisor v) { this.advisor = v; return this; }
        public AdvisorRequestBuilder status(RequestStatus v) { this.status = v; return this; }
        public AdvisorRequest build() {
            AdvisorRequest r = new AdvisorRequest();
            r.project = this.project; r.advisor = this.advisor; r.status = this.status;
            return r;
        }
    }

    public Long getId() { return id; }
    public Project getProject() { return project; }
    public Advisor getAdvisor() { return advisor; }
    public RequestStatus getStatus() { return status; }
    public LocalDateTime getRequestDate() { return requestDate; }
    public LocalDateTime getResponseDate() { return responseDate; }
    public void setStatus(RequestStatus v) { this.status = v; }
    public void setResponseDate(LocalDateTime v) { this.responseDate = v; }
}
