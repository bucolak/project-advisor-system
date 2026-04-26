package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entity.Advisor;
import com.example.demo.entity.AdvisorRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.Student;
import com.example.demo.entity.User;
import com.example.demo.enums.RequestStatus;
import com.example.demo.repository.AdvisorRepository;
import com.example.demo.repository.AdvisorRequestRepository;
import com.example.demo.repository.StudentRepository;

@Service
public class AdvisorRequestService {

    private final AdvisorRequestRepository advisorRequestRepository;
    private final AdvisorRepository advisorRepository;
    private final StudentRepository studentRepository;

    public AdvisorRequestService(
            AdvisorRequestRepository advisorRequestRepository,
            AdvisorRepository advisorRepository,
            StudentRepository studentRepository
    ) {
        this.advisorRequestRepository = advisorRequestRepository;
        this.advisorRepository = advisorRepository;
        this.studentRepository = studentRepository;
    }

    public List<Map<String, Object>> getPendingRequestsForAdvisor(Long advisorUserId) {
        Advisor advisor = advisorRepository.findById(advisorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advisor not found."));

        return advisorRequestRepository
                .findByAdvisorAndStatus(advisor, RequestStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<Map<String, Object>> getRequestsForStudent(Long studentUserId) {
        Student student = studentRepository.findById(studentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found."));

        return advisorRequestRepository
                .findByProjectStudent(student)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public Map<String, Object> updateRequestStatus(Long advisorUserId, Long requestId, RequestStatus status) {
        Advisor advisor = advisorRepository.findById(advisorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advisor not found."));

        AdvisorRequest request = advisorRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found."));

        if (!request.getAdvisor().getUserId().equals(advisor.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This request does not belong to you.");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This request is already processed.");
        }

        request.setStatus(status);
        request.setResponseDate(LocalDateTime.now());

        if (status == RequestStatus.ACCEPTED) {
            advisor.setCurrentQuota(advisor.getCurrentQuota() + 1);
            advisorRepository.save(advisor);
        }

        return toResponse(advisorRequestRepository.save(request));
    }

    private Map<String, Object> toResponse(AdvisorRequest request) {
        Project project = request.getProject();
        Student student = project.getStudent();
        User studentUser = student.getUser();

        Advisor advisor = request.getAdvisor();
        User advisorUser = advisor.getUser();

        Map<String, Object> map = new HashMap<>();

        map.put("id", request.getId());
        map.put("status", request.getStatus().name());
        map.put("requestDate", request.getRequestDate());
        map.put("responseDate", request.getResponseDate());

        map.put("projectId", project.getId());
        map.put("projectTitle", project.getTitle());
        map.put("projectDescription", project.getDescription());
        map.put("projectType", project.getCategory() != null ? project.getCategory().getName() : "PROJECT");

        map.put("studentId", studentUser.getId());
        map.put("studentName", studentUser.getFirstName() + " " + studentUser.getLastName());
        map.put("studentDepartment", student.getDepartment());
        map.put("studentSkills", student.getSkills());

        map.put("advisorId", advisorUser.getId());
        map.put("advisorName", advisorUser.getFirstName() + " " + advisorUser.getLastName());
        map.put("advisorDepartment", advisor.getDepartment());
        map.put("advisorTitle", advisor.getTitle());

        return map;
    }
}
