package com.example.demo.controller;

import com.example.demo.dto.request.UpdateStatusRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.service.AdminService;
import com.example.demo.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;
    private final ProjectService projectService;
    public AdminController(AdminService adminService, ProjectService projectService) {
        this.adminService = adminService; this.projectService = projectService;
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
    public ResponseEntity<ApiResponse> updateUserStatus(@PathVariable Long userId,
            @RequestBody UpdateStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Güncellendi.", adminService.updateUserStatus(userId, req.getStatus())));
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

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse> createCategory(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Kategori oluşturuldu.", adminService.createCategory(body.get("name"))));
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
    public ResponseEntity<ApiResponse> createAnnouncement(Authentication auth,
            @RequestBody Map<String, String> body) {
        Long adminId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok("Duyuru oluşturuldu.",
                adminService.createAnnouncement(body.get("title"), body.get("content"),
                        body.get("targetRole"), adminId)));
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse> deleteAnnouncement(@PathVariable Long id) {
        adminService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.ok("Duyuru silindi.", null));
    }
}
