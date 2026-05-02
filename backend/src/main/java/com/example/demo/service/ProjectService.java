package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.example.demo.entity.User;
import com.example.demo.enums.AdvisingStatus;
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

        Boolean advisorRequired =
                req.getAdvisorRequired() != null ? req.getAdvisorRequired() : true;

        Project project = Project.builder()
                .student(student)
                .title(req.getTitle())
                .description(req.getDescription())
                .requiredSkills(req.getRequiredSkills())
                .teamSize(req.getTeamSize())
                .rolesNeeded(req.getRolesNeeded())
                .category(category)
                .advisorRequired(advisorRequired)
                .status(ProjectStatus.OPEN)
                .isDeleted(false)
                .build();

        return projectRepository.save(project);
    }

    public Map<String, Object> getProjectDetail(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proje bulunamadı."));

        if (project.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Proje bulunamadı.");
        }

        Student student = project.getStudent();
        User user = student.getUser();

        Map<String, Object> map = new HashMap<>();

        map.put("id", project.getId());
        map.put("title", project.getTitle());
        map.put("description", project.getDescription());
        map.put("requiredSkills", project.getRequiredSkills());
        map.put("teamSize", project.getTeamSize());
        map.put("rolesNeeded", project.getRolesNeeded());
        map.put("status", project.getStatus().name());
        map.put("createdAt", project.getCreatedAt());
        map.put("advisorRequired", project.getAdvisorRequired());

        if (project.getCategory() != null) {
            map.put("categoryId", project.getCategory().getId());
            map.put("categoryName", project.getCategory().getName());
            map.put("categoryDescription", project.getCategory().getDescription());
            map.put("categoryBudget", project.getCategory().getBudget());
            map.put("categoryAdvisorRequired", project.getCategory().getAdvisorRequired());
        } else {
            map.put("categoryId", null);
            map.put("categoryName", "PROJECT");
            map.put("categoryDescription", null);
            map.put("categoryBudget", null);
            map.put("categoryAdvisorRequired", null);
        }

        map.put("studentId", user.getId());
        map.put("studentName", user.getFirstName() + " " + user.getLastName());
        map.put("studentEmail", user.getEmail());
        map.put("studentDepartment", student.getDepartment());
        map.put("studentYear", student.getYear());
        map.put("studentClass", student.getYear());
        map.put("studentGpa", student.getGpa());
        map.put("studentGPA", student.getGpa());
        map.put("studentSkills", student.getSkills());
        map.put("studentGithub", student.getGithubLink());
        map.put("studentGitHub", student.getGithubLink());
        map.put("studentLinkedin", student.getLinkedinLink());

        map.put("ownerId", user.getId());
        map.put("ownerName", user.getFirstName() + " " + user.getLastName());
        map.put("ownerEmail", user.getEmail());
        map.put("ownerDepartment", student.getDepartment());
        map.put("ownerYear", student.getYear());
        map.put("ownerClass", student.getYear());
        map.put("ownerGpa", student.getGpa());
        map.put("ownerGPA", student.getGpa());
        map.put("ownerSkills", student.getSkills());
        map.put("ownerGithub", student.getGithubLink());
        map.put("ownerGitHub", student.getGithubLink());
        map.put("ownerLinkedin", student.getLinkedinLink());

        map.put("student", student);

        return map;
    }

    public List<Project> getMyProjects(Long userId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        return projectRepository.findByStudentAndIsDeletedFalse(student);
    }

    public List<ProjectApplication> getJoinedProjects(Long userId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        return projectApplicationRepository.findByStudentAndStatus(student, ApplicationStatus.ACCEPTED);
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

        ProjectApplication savedApplication = projectApplicationRepository.save(application);

        notificationService.createNotification(
                project.getStudent().getUser(),
                applicant.getUser().getFirstName()
                        + " "
                        + applicant.getUser().getLastName()
                        + " wants to join your project "
                        + project.getTitle()
        );

        return savedApplication;
    }

    public List<ProjectApplication> getIncomingApplications(Long ownerId) {
        Student owner = studentRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        return projectApplicationRepository.findByProjectStudent(owner);
    }

    @Transactional
    public ProjectApplication respondApplication(Long ownerId, Long applicationId, String status) {
        Student owner = studentRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Öğrenci bulunamadı."));

        ProjectApplication application = projectApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Başvuru bulunamadı."));

        if (!application.getProject().getStudent().getUserId().equals(owner.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu proje size ait değil.");
        }

        ApplicationStatus newStatus;

        if (status.equalsIgnoreCase("ACCEPTED")) {
            newStatus = ApplicationStatus.ACCEPTED;
        } else if (status.equalsIgnoreCase("REJECTED")) {
            newStatus = ApplicationStatus.REJECTED;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz durum.");
        }

        application.setStatus(newStatus);

        ProjectApplication savedApplication = projectApplicationRepository.save(application);

        String resultText = newStatus == ApplicationStatus.ACCEPTED ? "accepted" : "rejected";

        notificationService.createNotification(
                application.getStudent().getUser(),
                "Your application for "
                        + application.getProject().getTitle()
                        + " has been "
                        + resultText
                        + "."
        );

        return savedApplication;
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

        if (project.getAdvisorRequired() != null && !project.getAdvisorRequired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu proje için danışman gerekli değil.");
        }

        Advisor advisor = advisorRepository.findById(advisorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danışman bulunamadı."));

        if (advisor.getAdvisingStatus() != AdvisingStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu danışman şu anda istek kabul etmiyor.");
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