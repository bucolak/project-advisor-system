package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "project_categories")
public class ProjectCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;

    public ProjectCategory() {}

    public static ProjectCategoryBuilder builder() { return new ProjectCategoryBuilder(); }

    public static class ProjectCategoryBuilder {
        private String name;
        public ProjectCategoryBuilder name(String v) { this.name = v; return this; }
        public ProjectCategory build() {
            ProjectCategory c = new ProjectCategory();
            c.name = this.name;
            return c;
        }
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
}
