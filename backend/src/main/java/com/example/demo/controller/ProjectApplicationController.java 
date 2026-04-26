package com.example.demo.controller;

import com.example.demo.dto.response.ApiResponse;
import com.example.demo.service.ProjectService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student-requests")
public class ProjectApplicationController {

    private final ProjectService projectService;

    public ProjectApplicationController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Sude kendi projelerine gelen başvuruları görsün
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> incomingRequests(Authentication auth){

        Long userId=(Long) auth.getPrincipal();

        return ResponseEntity.ok(
            ApiResponse.ok(
                "Incoming requests listed",
                projectService.getIncomingApplications(userId)
            )
        );
    }


    // Accept / Reject
    @PutMapping("/{applicationId}/response")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> respond(
            Authentication auth,
            @PathVariable Long applicationId,
            @RequestParam String status
    ){

        Long userId=(Long) auth.getPrincipal();

        return ResponseEntity.ok(
            ApiResponse.ok(
                "Application updated",
                projectService.respondApplication(
                        userId,
                        applicationId,
                        status
                )
            )
        );
    }
}