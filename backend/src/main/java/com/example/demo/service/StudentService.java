package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.response.StudentProfileResponse;
import com.example.demo.entity.Project;
import com.example.demo.entity.Student;
import com.example.demo.entity.User;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.UserRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public StudentService(
            StudentRepository studentRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository
    ) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    public StudentProfileResponse getStudentProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found."));

        return new StudentProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                student.getDepartment(),
                student.getYear(),
                student.getGpa(),
                student.getSkills(),
                student.getGithubLink(),
                student.getLinkedinLink(),
                student.getResearchInterests(),
                student.getRelevantCourses()
        );
    }

    public Map<String, Object> getStudentProfileWithProjects(Long userId) {

        StudentProfileResponse profile = getStudentProfile(userId);

        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found."));

        List<Project> projects = projectRepository
                .findTop2ByStudentAndIsDeletedFalseOrderByCreatedAtDesc(student);

        Map<String, Object> map = new HashMap<>();

        map.put("profile", profile);

        map.put("projects", projects);

        return map;

    }

    public StudentProfileResponse updateStudentProfile(Long userId, Map<String, Object> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found."));

        if (body.get("firstName") != null) {
            user.setFirstName(body.get("firstName").toString());
        }

        if (body.get("lastName") != null) {
            user.setLastName(body.get("lastName").toString());
        }

        if (body.get("email") != null) {
            user.setEmail(body.get("email").toString());
        }

        if (body.get("department") != null) {
            student.setDepartment(body.get("department").toString());
        }

        if (body.get("year") != null && !body.get("year").toString().isBlank()) {
            student.setYear(Integer.parseInt(body.get("year").toString()));
        }

        if (body.get("gpa") != null && !body.get("gpa").toString().isBlank()) {
            student.setGpa(Double.parseDouble(body.get("gpa").toString()));
        }

        if (body.get("skills") != null) {
            student.setSkills(body.get("skills").toString());
        }

        if (body.get("githubLink") != null) {
            student.setGithubLink(body.get("githubLink").toString());
        }

        if (body.get("linkedinLink") != null) {
            student.setLinkedinLink(body.get("linkedinLink").toString());
        }

        if (body.get("interests") != null) {
            student.setResearchInterests(body.get("interests").toString());
        }

        if (body.get("researchInterests") != null) {
            student.setResearchInterests(body.get("researchInterests").toString());
        }

        if (body.get("shortBio") != null) {
            student.setRelevantCourses(body.get("shortBio").toString());
        }

        if (body.get("relevantCourses") != null) {
            student.setRelevantCourses(body.get("relevantCourses").toString());
        }

        userRepository.save(user);
        studentRepository.save(student);

        return getStudentProfile(userId);
    }
}
