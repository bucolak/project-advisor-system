package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "announcement_types")
public class AnnouncementType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public AnnouncementType() {
    }

    public static AnnouncementTypeBuilder builder() {
        return new AnnouncementTypeBuilder();
    }

    public static class AnnouncementTypeBuilder {

        private String name;

        public AnnouncementTypeBuilder name(String name) {
            this.name = name;
            return this;
        }

        public AnnouncementType build() {
            AnnouncementType type = new AnnouncementType();
            type.name = this.name;
            return type;
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
