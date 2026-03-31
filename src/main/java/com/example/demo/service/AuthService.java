package com.example.demo.service;

import com.example.demo.dto.request.LoginRequest;
import com.example.demo.dto.request.RegisterAdvisorRequest;
import com.example.demo.dto.request.RegisterStudentRequest;
import com.example.demo.dto.response.AuthResponse;
import com.example.demo.entity.*;
import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.*;
import com.example.demo.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AdvisorRepository advisorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, StudentRepository studentRepository,
                       AdvisorRepository advisorRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.advisorRepository = advisorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse registerStudent(RegisterStudentRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu email zaten kayıtlı.");
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.STUDENT).firstName(req.getFirstName())
                .lastName(req.getLastName()).status(UserStatus.ACTIVE).isDeleted(false).build();
        userRepository.save(user);
        Student student = Student.builder().user(user).department(req.getDepartment())
                .year(req.getYear()).gpa(req.getGpa()).skills(req.getSkills())
                .githubLink(req.getGithubLink()).linkedinLink(req.getLinkedinLink()).build();
        studentRepository.save(student);
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getId());
    }

    @Transactional
    public AuthResponse registerAdvisor(RegisterAdvisorRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu email zaten kayıtlı.");
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.ADVISOR).firstName(req.getFirstName())
                .lastName(req.getLastName()).status(UserStatus.ACTIVE).isDeleted(false).build();
        userRepository.save(user);
        Advisor advisor = Advisor.builder().user(user).title(req.getTitle())
                .department(req.getDepartment()).areasOfExpertise(req.getAreasOfExpertise())
                .maxQuota(req.getMaxQuota() != null ? req.getMaxQuota() : 5).currentQuota(0).build();
        advisorRepository.save(advisor);
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getId());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email veya şifre hatalı."));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email veya şifre hatalı.");
        if (user.getIsDeleted())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu hesap silinmiştir.");
        if (user.getStatus() == UserStatus.INACTIVE)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu hesap pasif durumdadır.");
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getId());
    }
}
