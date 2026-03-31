package com.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateProjectRequest {
    @NotBlank
    private String title;
    private String description;
    private String requiredSkills;
    private Integer teamSize;
    private String rolesNeeded;
    private Long categoryId;

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getRequiredSkills() { return requiredSkills; }
    public Integer getTeamSize() { return teamSize; }
    public String getRolesNeeded() { return rolesNeeded; }
    public Long getCategoryId() { return categoryId; }
    public void setTitle(String v) { this.title = v; }
    public void setDescription(String v) { this.description = v; }
    public void setRequiredSkills(String v) { this.requiredSkills = v; }
    public void setTeamSize(Integer v) { this.teamSize = v; }
    public void setRolesNeeded(String v) { this.rolesNeeded = v; }
    public void setCategoryId(Long v) { this.categoryId = v; }
}
