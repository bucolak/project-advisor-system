package com.example.demo.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.request.CreateProjectRequest;
import com.example.demo.entity.Advisor;
import com.example.demo.entity.AdvisorRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.ProjectApplication;
import com.example.demo.entity.ProjectCategory;
import com.example.demo.entity.Student;
import com.example.demo.enums.ApplicationStatus;
import com.example.demo.enums.ProjectStatus;
import com.example.demo.enums.RequestStatus;
import com.example.demo.repository.AdvisorRepository;
import com.example.demo.repository.AdvisorRequestRepository;
import com.example.demo.repository.ProjectApplicationRepository;
import com.example.demo.repository.ProjectCategoryRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.StudentRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;
    private final AdvisorRepository advisorRepository;
    private final AdvisorRequestRepository advisorRequestRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    private final ProjectCategoryRepository categoryRepository;
    private final NotificationService notificationService;

    public ProjectService(
            ProjectRepository projectRepository,
            StudentRepository studentRepository,
            AdvisorRepository advisorRepository,
            AdvisorRequestRepository advisorRequestRepository,
            ProjectApplicationRepository projectApplicationRepository,
            ProjectCategoryRepository categoryRepository,
            NotificationService notificationService
    ) {
        this.projectRepository = projectRepository;
        this.studentRepository = studentRepository;
        this.advisorRepository = advisorRepository;
        this.advisorRequestRepository = advisorRequestRepository;
        this.projectApplicationRepository = projectApplicationRepository;
        this.categoryRepository = categoryRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Project createProject(Long userId, CreateProjectRequest req) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        ProjectCategory category = null;

        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kategori bulunamadı."));
        }

        Project project = Project.builder()
                .student(student)
                .title(req.getTitle())
                .description(req.getDescription())
                .requiredSkills(req.getRequiredSkills())
                .teamSize(req.getTeamSize())
                .rolesNeeded(req.getRolesNeeded())
                .category(category)
                .status(ProjectStatus.OPEN)
                .isDeleted(false)
                .build();

        return projectRepository.save(project);
    }

    public List<Project> getMyProjects(Long userId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        return projectRepository.findByStudentAndIsDeletedFalse(student);
    }

    public List<Project> getOpenProjectsForStudent(Long userId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        return projectRepository.findOpenProjectsExceptCurrentStudent(ProjectStatus.OPEN, student);
    }

    @Transactional
    public ProjectApplication applyToProject(Long userId, Long projectId) {
        Student applicant = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proje bulunamadı."));

        if (project.getStudent().getUserId().equals(applicant.getUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kendi projenize başvuramazsınız.");
        }

        projectApplicationRepository.findByProjectAndStudent(project, applicant).ifPresent(application -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu projeye zaten başvurdunuz.");
        });

        ProjectApplication application = ProjectApplication.builder()
                .project(project)
                .student(applicant)
                .status(ApplicationStatus.PENDING)
                .build();

        return projectApplicationRepository.save(application);
    }

    @Transactional
    public AdvisorRequest requestAdvisor(Long userId, Long projectId, Long advisorId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proje bulunamadı."));

        if (!project.getStudent().getUserId().equals(student.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu proje size ait değil.");
        }

        Advisor advisor = advisorRepository.findById(advisorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danışman bulunamadı."));

        if (advisor.getCurrentQuota() >= advisor.getMaxQuota()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu danışmanın kotası dolmuştur.");
        }

        advisorRequestRepository.findByProjectAndAdvisor(project, advisor).ifPresent(r -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu danışmana zaten istek gönderdiniz.");
        });

        AdvisorRequest request = AdvisorRequest.builder()
                .project(project)
                .advisor(advisor)
                .status(RequestStatus.PENDING)
                .build();

        return advisorRequestRepository.save(request);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findByIsDeletedFalse();
    }
}
