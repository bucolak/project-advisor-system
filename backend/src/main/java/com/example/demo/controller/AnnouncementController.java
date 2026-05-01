package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.response.ApiResponse;
import com.example.demo.entity.User;
import com.example.demo.enums.AnnouncementTarget;
import com.example.demo.enums.Role;
import com.example.demo.repository.AnnouncementRepository;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public AnnouncementController(
            AnnouncementRepository announcementRepository,
            UserRepository userRepository
    ) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse> getMyAnnouncements(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        List<AnnouncementTarget> targets;

        if (user.getRole() == Role.STUDENT) {
            targets = List.of(AnnouncementTarget.ALL, AnnouncementTarget.STUDENT);
        } else if (user.getRole() == Role.ADVISOR) {
            targets = List.of(AnnouncementTarget.ALL, AnnouncementTarget.ADVISOR);
        } else {
            targets = List.of(AnnouncementTarget.ALL, AnnouncementTarget.STUDENT, AnnouncementTarget.ADVISOR);
        }

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Announcements fetched.",
                        announcementRepository.findByTargetRoleIn(targets)
                )
        );
    }
}