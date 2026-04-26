package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.request.CreateProjectRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.service.AdvisorService;
import com.example.demo.service.ProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final AdvisorService advisorService;

    public ProjectController(ProjectService projectService, AdvisorService advisorService) {
        this.projectService = projectService;
        this.advisorService = advisorService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> createProject(
            Authentication auth,
            @Valid @RequestBody CreateProjectRequest req
    ) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok("Proje oluşturuldu.", projectService.createProject(userId, req))
        );
    }

    @GetMapping("/my-projects")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> getMyProjects(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok("Projeleriniz.", projectService.getMyProjects(userId))
        );
    }

    @GetMapping("/open")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> getOpenProjects(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok("Açık projeler listelendi.", projectService.getOpenProjectsForStudent(userId))
        );
    }

    @PostMapping("/{projectId}/apply")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> applyToProject(
            Authentication auth,
            @PathVariable Long projectId
    ) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok("Projeye başvuru gönderildi.", projectService.applyToProject(userId, projectId))
        );
    }

    @PostMapping("/{projectId}/request-advisor/{advisorId}")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> requestAdvisor(
            Authentication auth,
            @PathVariable Long projectId,
            @PathVariable Long advisorId
    ) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok("Danışman isteği gönderildi.", projectService.requestAdvisor(userId, projectId, advisorId))
        );
    }
}
