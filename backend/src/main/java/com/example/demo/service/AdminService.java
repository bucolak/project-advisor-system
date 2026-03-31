package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.enums.AnnouncementTarget;
import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectCategoryRepository categoryRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository, ProjectRepository projectRepository,
                        ProjectCategoryRepository categoryRepository,
                        AnnouncementRepository announcementRepository,
                        NotificationService notificationService) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.announcementRepository = announcementRepository;
        this.notificationService = notificationService;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", userRepository.findByRoleAndIsDeletedFalse(Role.STUDENT).size());
        stats.put("totalAdvisors", userRepository.findByRoleAndIsDeletedFalse(Role.ADVISOR).size());
        stats.put("totalProjects", projectRepository.countByIsDeletedFalse());
        return stats;
    }

    public List<User> getAllUsers() { return userRepository.findAll(); }

    @Transactional
    public User updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı."));
        user.setStatus(UserStatus.valueOf(status.toUpperCase()));
        return userRepository.save(user);
    }

    @Transactional
    public User softDeleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı."));
        user.setIsDeleted(true);
        return userRepository.save(user);
    }

    public List<ProjectCategory> getAllCategories() { return categoryRepository.findAll(); }

    public ProjectCategory createCategory(String name) {
        if (categoryRepository.existsByName(name))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu kategori zaten mevcut.");
        return categoryRepository.save(ProjectCategory.builder().name(name).build());
    }

    public void deleteCategory(Long id) { categoryRepository.deleteById(id); }

    public List<Announcement> getAllAnnouncements() { return announcementRepository.findAll(); }

    @Transactional
    public Announcement createAnnouncement(String title, String content, String targetRole, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin bulunamadı."));
        AnnouncementTarget target = AnnouncementTarget.valueOf(targetRole.toUpperCase());
        Announcement announcement = Announcement.builder()
                .title(title).content(content).targetRole(target).createdBy(admin).build();
        Announcement saved = announcementRepository.save(announcement);
        List<Role> roles = target == AnnouncementTarget.ALL ? List.of(Role.STUDENT, Role.ADVISOR)
                : target == AnnouncementTarget.STUDENT ? List.of(Role.STUDENT) : List.of(Role.ADVISOR);
        for (Role role : roles)
            userRepository.findByRoleAndIsDeletedFalse(role).forEach(user ->
                notificationService.createNotification(user, "Yeni duyuru: " + title));
        return saved;
    }

    public void deleteAnnouncement(Long id) { announcementRepository.deleteById(id); }
}
