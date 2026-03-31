package com.example.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterStudentRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    private String department;
    private Integer year;
    private Double gpa;
    private String skills;
    private String githubLink;
    private String linkedinLink;

    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getDepartment() { return department; }
    public Integer getYear() { return year; }
    public Double getGpa() { return gpa; }
    public String getSkills() { return skills; }
    public String getGithubLink() { return githubLink; }
    public String getLinkedinLink() { return linkedinLink; }
    public void setEmail(String v) { this.email = v; }
    public void setPassword(String v) { this.password = v; }
    public void setFirstName(String v) { this.firstName = v; }
    public void setLastName(String v) { this.lastName = v; }
    public void setDepartment(String v) { this.department = v; }
    public void setYear(Integer v) { this.year = v; }
    public void setGpa(Double v) { this.gpa = v; }
    public void setSkills(String v) { this.skills = v; }
    public void setGithubLink(String v) { this.githubLink = v; }
    public void setLinkedinLink(String v) { this.linkedinLink = v; }
}
