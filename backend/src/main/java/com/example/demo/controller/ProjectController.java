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
import com.example.demo.service.ProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
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

    @GetMapping("/category/{categoryId}")
        @PreAuthorize("hasAuthority('ROLE_ADMIN')")
        public ResponseEntity<ApiResponse> getProjectsByCategory(@PathVariable Long categoryId) {
            return ResponseEntity.ok(
            ApiResponse.ok("Kategoriye ait projeler.", projectService.getProjectsByCategory(categoryId))
    );
        }
    
    @GetMapping("/{projectId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADVISOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getProjectDetail(@PathVariable Long projectId) {
        return ResponseEntity.ok(
                ApiResponse.ok("Project detail fetched.", projectService.getProjectDetail(projectId))
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

    @GetMapping("/joined-projects")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> getJoinedProjects(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok("Joined projects listed.", projectService.getJoinedProjects(userId))
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

    @GetMapping("/incoming-applications")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> getIncomingApplications(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok("Incoming applications listed.", projectService.getIncomingApplications(userId))
        );
    }

    @PostMapping("/applications/{applicationId}/respond/{status}")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> respondApplication(
            Authentication auth,
            @PathVariable Long applicationId,
            @PathVariable String status
    ) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Application updated.",
                        projectService.respondApplication(userId, applicationId, status)
                )
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