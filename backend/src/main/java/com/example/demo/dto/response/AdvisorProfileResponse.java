package com.example.demo.dto.response;

public class AdvisorProfileResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String title;
    private String department;
    private String areasOfExpertise;
    private Integer currentQuota;
    private Integer maxQuota;
    private String advisingStatus;

    public AdvisorProfileResponse(
            Long userId,
            String firstName,
            String lastName,
            String email,
            String title,
            String department,
            String areasOfExpertise,
            Integer currentQuota,
            Integer maxQuota,
            String advisingStatus
    ) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.title = title;
        this.department = department;
        this.areasOfExpertise = areasOfExpertise;
        this.currentQuota = currentQuota;
        this.maxQuota = maxQuota;
        this.advisingStatus = advisingStatus;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getTitle() {
        return title;
    }

    public String getDepartment() {
        return department;
    }

    public String getAreasOfExpertise() {
        return areasOfExpertise;
    }

    public Integer getCurrentQuota() {
        return currentQuota;
    }

    public Integer getMaxQuota() {
        return maxQuota;
    }

    public String getAdvisingStatus() {
        return advisingStatus;
    }
}
