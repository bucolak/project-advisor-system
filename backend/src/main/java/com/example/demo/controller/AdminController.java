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
        return ResponseEntity.ok(ApiResponse.ok("İstatistikler.", adminService.getStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok("Tüm kullanıcılar.", adminService.getAllUsers()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UpdateStatusRequest req
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok("Güncellendi.", adminService.updateUserStatus(userId, req.getStatus()))
        );
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long userId) {
        adminService.softDeleteUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("Silindi.", null));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.ok("Tüm projeler.", projectService.getAllProjects()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok("Kategoriler.", adminService.getAllCategories()));
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> getCategoryById(@PathVariable Long id) {
        ProjectCategory category = projectCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        return ResponseEntity.ok(ApiResponse.ok("Kategori bulundu.", category));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse> createCategory(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ApiResponse.ok("Kategori oluşturuldu.", adminService.createCategory(body.get("name")))
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

        if ("COURSE".equalsIgnoreCase(category.getName())) {
            category.setAdvisorRequired(false);
        } else if (body.get("advisorRequired") != null) {
            category.setAdvisorRequired(Boolean.parseBoolean(body.get("advisorRequired").toString()));
        }

        ProjectCategory updatedCategory = projectCategoryRepository.save(category);

        return ResponseEntity.ok(ApiResponse.ok("Kategori güncellendi.", updatedCategory));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Kategori silindi.", null));
    }

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse> getAnnouncements() {
        return ResponseEntity.ok(ApiResponse.ok("Duyurular.", adminService.getAllAnnouncements()));
    }

    @PostMapping("/announcements")
    public ResponseEntity<ApiResponse> createAnnouncement(
            Authentication auth,
            @RequestBody Map<String, String> body
    ) {
        Long adminId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Duyuru oluşturuldu.",
                        adminService.createAnnouncement(
                                body.get("title"),
                                body.get("content"),
                                body.get("targetRole"),
                                adminId
                        )
                )
        );
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse> deleteAnnouncement(@PathVariable Long id) {
        adminService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.ok("Duyuru silindi.", null));
    }
}
