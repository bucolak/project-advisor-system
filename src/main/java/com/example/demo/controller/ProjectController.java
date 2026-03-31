package com.example.demo.controller;

import com.example.demo.dto.request.CreateProjectRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.service.AdvisorService;
import com.example.demo.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;
    private final AdvisorService advisorService;
    public ProjectController(ProjectService projectService, AdvisorService advisorService) {
        this.projectService = projectService; this.advisorService = advisorService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> createProject(Authentication auth,
            @Valid @RequestBody CreateProjectRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok("Proje oluşturuldu.", projectService.createProject(userId, req)));
    }

    @GetMapping("/my-projects")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> getMyProjects(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok("Projeleriniz.", projectService.getMyProjects(userId)));
    }

    @PostMapping("/{projectId}/request-advisor/{advisorId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> requestAdvisor(Authentication auth,
            @PathVariable Long projectId, @PathVariable Long advisorId) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok("Danışman isteği gönderildi.",
                projectService.requestAdvisor(userId, projectId, advisorId)));
    }
}
