package com.example.demo.repository;

import com.example.demo.entity.ProjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectCategoryRepository extends JpaRepository<ProjectCategory, Long> {
    boolean existsByName(String name);
}
