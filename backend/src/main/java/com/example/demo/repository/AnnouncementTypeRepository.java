package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.AnnouncementType;

public interface AnnouncementTypeRepository extends JpaRepository<AnnouncementType, Long> {

    boolean existsByName(String name);
}
