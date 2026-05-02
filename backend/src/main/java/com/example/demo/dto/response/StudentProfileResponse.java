package com.example.demo.dto.response;

public class StudentProfileResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private Integer year;
    private Double gpa;
    private String skills;
    private String githubLink;
    private String linkedinLink;
    private String researchInterests;
    private String relevantCourses;

    public StudentProfileResponse(Long userId,
                                  String firstName,
                                  String lastName,
                                  String email,
                                  String department,
                                  Integer year,
                                  Double gpa,
                                  String skills,
                                  String githubLink,
                                  String linkedinLink,
                                  String researchInterests,
                                  String relevantCourses) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.year = year;
        this.gpa = gpa;
        this.skills = skills;
        this.githubLink = githubLink;
        this.linkedinLink = linkedinLink;
        this.researchInterests = researchInterests;
        this.relevantCourses = relevantCourses;
    }

    public Long getUserId() { return userId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getDepartment() { return department; }
    public Integer getYear() { return year; }
    public Double getGpa() { return gpa; }
    public String getSkills() { return skills; }
    public String getGithubLink() { return githubLink; }
    public String getLinkedinLink() { return linkedinLink; }
    public String getResearchInterests() { return researchInterests; }
    public String getRelevantCourses() { return relevantCourses; }
    public String getShortBio() {
    return relevantCourses;
}

public String getBio() {
    return relevantCourses;
}

public String getInterests() {
    return researchInterests;
}
}