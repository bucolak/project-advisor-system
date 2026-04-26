package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entity.Announcement;
import com.example.demo.entity.AnnouncementType;
import com.example.demo.entity.ProjectCategory;
import com.example.demo.entity.User;
import com.example.demo.enums.AnnouncementTarget;
import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.AnnouncementRepository;
import com.example.demo.repository.AnnouncementTypeRepository;
import com.example.demo.repository.ProjectCategoryRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectCategoryRepository categoryRepository;
    private final AnnouncementRepository announcementRepository;
    private final AnnouncementTypeRepository announcementTypeRepository;
    private final NotificationService notificationService;

    public AdminService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectCategoryRepository categoryRepository,
            AnnouncementRepository announcementRepository,
            AnnouncementTypeRepository announcementTypeRepository,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.announcementRepository = announcementRepository;
        this.announcementTypeRepository = announcementTypeRepository;
        this.notificationService = notificationService;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", userRepository.findByRoleAndIsDeletedFalse(Role.STUDENT).size());
        stats.put("totalAdvisors", userRepository.findByRoleAndIsDeletedFalse(Role.ADVISOR).size());
        stats.put("totalProjects", projectRepository.countByIsDeletedFalse());
        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

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

    public List<ProjectCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<AnnouncementType> getAnnouncementTypes() {
        return announcementTypeRepository.findAll();
    }

    public ProjectCategory createCategory(
            String name,
            String description,
            String teamSize,
            Double budget,
            Boolean advisorRequired
    ) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kategori adı boş olamaz.");
        }

        if (categoryRepository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu kategori zaten mevcut.");
        }

        boolean finalAdvisorRequired = advisorRequired != null ? advisorRequired : true;

        if ("COURSE".equalsIgnoreCase(name)) {
            finalAdvisorRequired = false;
        }

        ProjectCategory category = ProjectCategory.builder()
                .name(name)
                .description(description)
                .teamSize(teamSize)
                .budget(budget)
                .advisorRequired(finalAdvisorRequired)
                .build();

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    @Transactional
    public Announcement createAnnouncement(String title, String content, String targetRole, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin bulunamadı."));

        AnnouncementTarget target = AnnouncementTarget.valueOf(targetRole.toUpperCase());

        Announcement announcement = Announcement.builder()
                .title(title)
                .content(content)
                .targetRole(target)
                .createdBy(admin)
                .build();

        Announcement saved = announcementRepository.save(announcement);

        List<Role> roles = target == AnnouncementTarget.ALL
                ? List.of(Role.STUDENT, Role.ADVISOR)
                : target == AnnouncementTarget.STUDENT
                        ? List.of(Role.STUDENT)
                        : List.of(Role.ADVISOR);

        for (Role role : roles) {
            userRepository.findByRoleAndIsDeletedFalse(role).forEach(user
                    -> notificationService.createNotification(user, "Yeni duyuru: " + title)
            );
        }

        return saved;
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
}
