package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.request.UpdateStatusRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.entity.ProjectCategory;
import com.example.demo.repository.ProjectCategoryRepository;
import com.example.demo.service.AdminService;
import com.example.demo.service.ProjectService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ProjectService projectService;
    private final ProjectCategoryRepository projectCategoryRepository;

    public AdminController(
            AdminService adminService,
            ProjectService projectService,
            ProjectCategoryRepository projectCategoryRepository
    ) {
        this.adminService = adminService;
        this.projectService = projectService;
        this.projectCategoryRepository = projectCategoryRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Statistics.", adminService.getStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok("All users.", adminService.getAllUsers()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UpdateStatusRequest req
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Updated.", adminService.updateUserStatus(userId, req.getStatus()))
        );
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long userId) {
        adminService.softDeleteUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("Deleted.", null));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.ok("All projects.", projectService.getAllProjects()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok("Categories.", adminService.getAllCategories()));
    }

    @GetMapping("/announcement-types")
    public ResponseEntity<ApiResponse> getAnnouncementTypes() {
        return ResponseEntity.ok(
                ApiResponse.ok("Announcement types.", adminService.getAnnouncementTypes())
        );
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> getCategoryById(@PathVariable Long id) {
        ProjectCategory category = projectCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        return ResponseEntity.ok(ApiResponse.ok("Category found.", category));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse> createCategory(@RequestBody Map<String, Object> body) {
        String name = body.get("name") != null ? body.get("name").toString() : null;
        String description = body.get("description") != null ? body.get("description").toString() : null;
        String teamSize = body.get("teamSize") != null ? body.get("teamSize").toString() : null;

        Double budget = 0.0;
        if (body.get("budget") != null && !body.get("budget").toString().isBlank()) {
            budget = Double.parseDouble(body.get("budget").toString());
        }

        Boolean advisorRequired = true;
        if (body.get("advisorRequired") != null) {
            advisorRequired = Boolean.parseBoolean(body.get("advisorRequired").toString());
        }

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Category created.",
                        adminService.createCategory(name, description, teamSize, budget, advisorRequired)
                )
        );
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        ProjectCategory category = projectCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        if (body.get("name") != null) {
            category.setName(body.get("name").toString());
        }

        if (body.get("description") != null) {
            category.setDescription(body.get("description").toString());
        }

        if (body.get("teamSize") != null) {
            category.setTeamSize(body.get("teamSize").toString());
        }

        if (body.get("budget") != null && !body.get("budget").toString().isBlank()) {
            category.setBudget(Double.parseDouble(body.get("budget").toString()));
        }

        if ("COURSE".equalsIgnoreCase(category.getName())) {
            category.setAdvisorRequired(false);
        } else if (body.get("advisorRequired") != null) {
            category.setAdvisorRequired(Boolean.parseBoolean(body.get("advisorRequired").toString()));
        }

        ProjectCategory updatedCategory = projectCategoryRepository.save(category);

        return ResponseEntity.ok(ApiResponse.ok("Category updated.", updatedCategory));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted.", null));
    }

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse> getAnnouncements() {
        return ResponseEntity.ok(ApiResponse.ok("Announcements.", adminService.getAllAnnouncements()));
    }

    @GetMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse> getAnnouncementById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Announcement found.", adminService.getAnnouncementById(id))
        );
    }

    @PutMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse> updateAnnouncement(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Announcement updated.", adminService.updateAnnouncement(id, body))
        );
    }

    @PostMapping("/announcements")
    public ResponseEntity<ApiResponse> createAnnouncement(
            Authentication auth,
            @RequestBody Map<String, String> body
    ) {
        Long adminId = (Long) auth.getPrincipal();

        String title = body.get("title");
        String category = body.get("category");
        String deadline = body.get("deadline");
        String type = body.get("type");
        String description = body.get("description");

        String content
                = "Category: " + category
                + "\nType: " + type
                + "\nDeadline: " + deadline
                + "\nDescription: " + description;

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Announcement created.",
                        adminService.createAnnouncement(
                                title,
                                content,
                                "ALL",
                                adminId
                        )
                )
        );
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse> deleteAnnouncement(@PathVariable Long id) {
        adminService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.ok("Announcement deleted.", null));
    }
}
