package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_categories")
public class ProjectCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    private String teamSize;

    private Double budget;

    @Column(nullable = false)
    private Boolean advisorRequired;

    public ProjectCategory() {
    }

    public static ProjectCategoryBuilder builder() {
        return new ProjectCategoryBuilder();
    }

    public static class ProjectCategoryBuilder {

        private String name;
        private String description;
        private String teamSize;
        private Double budget;
        private Boolean advisorRequired;

        public ProjectCategoryBuilder name(String v) {
            this.name = v;
            return this;
        }

        public ProjectCategoryBuilder description(String v) {
            this.description = v;
            return this;
        }

        public ProjectCategoryBuilder teamSize(String v) {
            this.teamSize = v;
            return this;
        }

        public ProjectCategoryBuilder budget(Double v) {
            this.budget = v;
            return this;
        }

        public ProjectCategoryBuilder advisorRequired(Boolean v) {
            this.advisorRequired = v;
            return this;
        }

        public ProjectCategory build() {

            ProjectCategory c = new ProjectCategory();

            c.name = this.name;
            c.description = this.description;
            c.teamSize = this.teamSize;
            c.budget = this.budget;
            c.advisorRequired = this.advisorRequired;

            return c;
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String v) {
        this.name = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTeamSize() {
        return teamSize;
    }

    public void setTeamSize(String teamSize) {
        this.teamSize = teamSize;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public Boolean getAdvisorRequired() {
        return advisorRequired;
    }

    public void setAdvisorRequired(Boolean advisorRequired) {
        this.advisorRequired = advisorRequired;
    }

}
