package com.example.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterAdvisorRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    private String title;
    private String department;
    private String areasOfExpertise;
    private Integer maxQuota;

    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getTitle() { return title; }
    public String getDepartment() { return department; }
    public String getAreasOfExpertise() { return areasOfExpertise; }
    public Integer getMaxQuota() { return maxQuota; }
    public void setEmail(String v) { this.email = v; }
    public void setPassword(String v) { this.password = v; }
    public void setFirstName(String v) { this.firstName = v; }
    public void setLastName(String v) { this.lastName = v; }
    public void setTitle(String v) { this.title = v; }
    public void setDepartment(String v) { this.department = v; }
    public void setAreasOfExpertise(String v) { this.areasOfExpertise = v; }
    public void setMaxQuota(Integer v) { this.maxQuota = v; }
}
