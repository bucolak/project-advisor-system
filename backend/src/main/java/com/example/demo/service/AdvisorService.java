package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.response.AdvisorProfileResponse;
import com.example.demo.entity.Advisor;
import com.example.demo.entity.AdvisorRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.Student;
import com.example.demo.entity.User;
import com.example.demo.enums.AdvisingStatus;
import com.example.demo.enums.RequestStatus;
import com.example.demo.repository.AdvisorRepository;
import com.example.demo.repository.AdvisorRequestRepository;
import com.example.demo.repository.UserRepository;

@Service
public class AdvisorService {

    private final AdvisorRepository advisorRepository;
    private final UserRepository userRepository;
    private final AdvisorRequestRepository advisorRequestRepository;

    public AdvisorService(
            AdvisorRepository advisorRepository,
            UserRepository userRepository,
            AdvisorRequestRepository advisorRequestRepository
    ) {
        this.advisorRepository = advisorRepository;
        this.userRepository = userRepository;
        this.advisorRequestRepository = advisorRequestRepository;
    }

    public List<AdvisorProfileResponse> getAllAdvisors() {
        return advisorRepository.findAll()
                .stream()
                .map(this::toProfileResponse)
                .toList();
    }

    public List<AdvisorProfileResponse> getActiveAdvisors() {
        return advisorRepository.findByAdvisingStatus(AdvisingStatus.ACTIVE)
                .stream()
                .map(this::toProfileResponse)
                .toList();
    }

    public AdvisorProfileResponse getAdvisorProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        Advisor advisor = advisorRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advisor profile not found."));

        return toProfileResponse(advisor);
    }

    @Transactional
    public AdvisorProfileResponse updateAdvisorProfile(Long advisorUserId, Map<String, Object> body) {
        User user = userRepository.findById(advisorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        Advisor advisor = advisorRepository.findById(advisorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advisor profile not found."));

        if (body.get("firstName") != null) {
            user.setFirstName(body.get("firstName").toString());
        }

        if (body.get("lastName") != null) {
            user.setLastName(body.get("lastName").toString());
        }

        if (body.get("email") != null) {
            user.setEmail(body.get("email").toString());
        }

        if (body.get("title") != null) {
            advisor.setTitle(body.get("title").toString());
        }

        if (body.get("department") != null) {
            advisor.setDepartment(body.get("department").toString());
        }

        if (body.get("areasOfExpertise") != null) {
            advisor.setAreasOfExpertise(body.get("areasOfExpertise").toString());
        }

        if (body.get("maxQuota") != null && !body.get("maxQuota").toString().isBlank()) {
            advisor.setMaxQuota(Integer.parseInt(body.get("maxQuota").toString()));
        }

        userRepository.save(user);
        advisorRepository.save(advisor);

        return getAdvisorProfile(advisorUserId);
    }

    @Transactional
    public AdvisorProfileResponse updateAdvisingStatus(Long advisorUserId, String status) {
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status boş olamaz.");
        }

        Advisor advisor = advisorRepository.findById(advisorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advisor profile not found."));

        AdvisingStatus newStatus;

        try {
            newStatus = AdvisingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz status. ACTIVE veya INACTIVE gönder.");
        }

        advisor.setAdvisingStatus(newStatus);
        advisorRepository.save(advisor);

        return getAdvisorProfile(advisorUserId);
    }

    public List<Map<String, Object>> getMyStudents(Long advisorUserId) {
        Advisor advisor = advisorRepository.findById(advisorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advisor not found."));

        List<AdvisorRequest> acceptedRequests =
                advisorRequestRepository.findByAdvisorAndStatus(advisor, RequestStatus.ACCEPTED);

        return acceptedRequests.stream()
                .map(this::toAdvisorStudentProjectResponse)
                .toList();
    }

    private AdvisorProfileResponse toProfileResponse(Advisor advisor) {
        User user = advisor.getUser();

        return new AdvisorProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                advisor.getTitle(),
                advisor.getDepartment(),
                advisor.getAreasOfExpertise(),
                advisor.getCurrentQuota(),
                advisor.getMaxQuota(),
                advisor.getAdvisingStatus().name()
        );
    }

    private Map<String, Object> toAdvisorStudentProjectResponse(AdvisorRequest request) {
        Project project = request.getProject();
        Student student = project.getStudent();
        User studentUser = student.getUser();

        Map<String, Object> map = new HashMap<>();

        map.put("requestId", request.getId());
        map.put("status", request.getStatus().name());

        map.put("projectId", project.getId());
        map.put("projectTitle", project.getTitle());
        map.put("projectDescription", project.getDescription());
        map.put("projectType", project.getCategory() != null ? project.getCategory().getName() : "PROJECT");
        map.put("requiredSkills", project.getRequiredSkills());
        map.put("teamSize", project.getTeamSize());
        map.put("rolesNeeded", project.getRolesNeeded());

        map.put("studentId", studentUser.getId());
        map.put("firstName", studentUser.getFirstName());
        map.put("lastName", studentUser.getLastName());
        map.put("studentName", studentUser.getFirstName() + " " + studentUser.getLastName());
        map.put("department", student.getDepartment());
        map.put("skills", student.getSkills());

        return map;
    }
}