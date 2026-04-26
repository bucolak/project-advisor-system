package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.response.AdvisorProfileResponse;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.service.AdvisorService;

@RestController
@RequestMapping("/api/advisors")
public class AdvisorController {

    private final AdvisorService advisorService;

    public AdvisorController(AdvisorService advisorService) {
        this.advisorService = advisorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllAdvisors() {
        return ResponseEntity.ok(
                ApiResponse.ok("Advisors fetched.", advisorService.getAllAdvisors())
        );
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse> getAdvisorProfile(@PathVariable Long userId) {
        AdvisorProfileResponse profile = advisorService.getAdvisorProfile(userId);

        return ResponseEntity.ok(
                ApiResponse.ok("Advisor profile fetched.", profile)
        );
    }

    @GetMapping("/my-students")
    @PreAuthorize("hasAuthority('ROLE_ADVISOR')")
    public ResponseEntity<ApiResponse> getMyStudents(Authentication auth) {
        Long advisorUserId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Advisor accepted projects fetched.",
                        advisorService.getMyStudents(advisorUserId)
                )
        );
    }
}
