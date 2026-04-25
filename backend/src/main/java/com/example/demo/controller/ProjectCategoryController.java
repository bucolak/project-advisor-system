package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.response.ApiResponse;
import com.example.demo.entity.ProjectCategory;
import com.example.demo.repository.ProjectCategoryRepository;

@RestController
@RequestMapping("/api/categories")
public class ProjectCategoryController {

    private final ProjectCategoryRepository projectCategoryRepository;

    public ProjectCategoryController(ProjectCategoryRepository projectCategoryRepository) {
        this.projectCategoryRepository = projectCategoryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCategories() {
        List<ProjectCategory> categories = projectCategoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok("Kategoriler.", categories));
    }
}
