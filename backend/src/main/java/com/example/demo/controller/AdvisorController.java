package com.example.demo.controller;

import com.example.demo.dto.request.UpdateStatusRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.service.AdvisorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AdvisorController {
    private final AdvisorService advisorService;
    public AdvisorController(AdvisorService advisorService) { this.advisorService = advisorService; }

    @GetMapping("/advisors")
    public ResponseEntity<ApiResponse> getActiveAdvisors() {
        return ResponseEntity.ok(ApiResponse.ok("Aktif danışmanlar.", advisorService.getActiveAdvisors()));
    }

    @GetMapping("/advisor-requests/pending")
    @PreAuthorize("hasRole('ADVISOR')")
    public ResponseEntity<ApiResponse> getPendingRequests(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok("Bekleyen istekler.", advisorService.getPendingRequests(userId)));
    }

    @PutMapping("/advisor-requests/{requestId}/status")
    @PreAuthorize("hasRole('ADVISOR')")
    public ResponseEntity<ApiResponse> updateStatus(Authentication auth,
            @PathVariable Long requestId, @RequestBody UpdateStatusRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok("İstek güncellendi.",
                advisorService.updateRequestStatus(userId, requestId, req.getStatus())));
    }

    @GetMapping("/advisors/my-students")
    @PreAuthorize("hasRole('ADVISOR')")
    public ResponseEntity<ApiResponse> getMyStudents(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok("Öğrencileriniz.", advisorService.getMyStudents(userId)));
    }
}
