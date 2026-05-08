package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.example.demo.dto.response.ApiResponse;
import com.example.demo.enums.RequestStatus;
import com.example.demo.service.AdvisorRequestService;

@RestController
@RequestMapping("/api/advisor-requests")
public class AdvisorRequestController {

    private final AdvisorRequestService advisorRequestService;

    public AdvisorRequestController(AdvisorRequestService advisorRequestService) {
        this.advisorRequestService = advisorRequestService;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_ADVISOR')")
    public ResponseEntity<ApiResponse> getPendingRequests(Authentication auth) {
        Long advisorUserId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Pending advisor requests fetched.",
                        advisorRequestService.getPendingRequestsForAdvisor(advisorUserId)
                )
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_ADVISOR')")
    public ResponseEntity<ApiResponse> getAllAdvisorRequests(Authentication auth) {
        Long advisorUserId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Advisor requests fetched.",
                        advisorRequestService.getAllRequestsForAdvisor(advisorUserId)
                )
        );
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> getMyAdvisorRequests(Authentication auth) {
        Long studentUserId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Student advisor requests fetched.",
                        advisorRequestService.getRequestsForStudent(studentUserId)
                )
        );
    }

    @PutMapping("/{requestId}/status")
    @PreAuthorize("hasAuthority('ROLE_ADVISOR')")
    public ResponseEntity<ApiResponse> updateRequestStatus(
            Authentication auth,
            @PathVariable Long requestId,
            @RequestBody Map<String, String> body
    ) {
        Long advisorUserId = (Long) auth.getPrincipal();

        String statusText = body.get("status");

        if (statusText == null || statusText.isBlank()) {
            throw new RuntimeException("Status is required.");
        }

        RequestStatus status = RequestStatus.valueOf(statusText.toUpperCase());

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Advisor request updated.",
                        advisorRequestService.updateRequestStatus(advisorUserId, requestId, status)
                )
        );
    }
    @DeleteMapping("/{requestId}")
@PreAuthorize("hasAuthority('ROLE_STUDENT')")
public ResponseEntity<ApiResponse> withdrawRequest(
        Authentication auth,
        @PathVariable Long requestId
) {
    Long studentUserId = (Long) auth.getPrincipal();

    return ResponseEntity.ok(
            ApiResponse.ok(
                    "Advisor request withdrawn.",
                    advisorRequestService.withdrawRequest(studentUserId, requestId)
            )
    );
}
    @GetMapping("/my-advisors")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> getMyAcceptedAdvisors(Authentication auth) {
        Long studentUserId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Accepted advisors fetched.",
                        advisorRequestService.getAcceptedAdvisorsForStudent(studentUserId)
                )
        );
    }
}
