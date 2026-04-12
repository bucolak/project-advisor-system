package com.example.demo.controller;

import com.example.demo.dto.request.LoginRequest;
import com.example.demo.dto.request.RegisterAdvisorRequest;
import com.example.demo.dto.request.RegisterStudentRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/register/student")
    public ResponseEntity<ApiResponse> registerStudent(@Valid @RequestBody RegisterStudentRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Kayıt başarılı.", authService.registerStudent(req)));
    }

    @PostMapping("/register/advisor")
    public ResponseEntity<ApiResponse> registerAdvisor(@Valid @RequestBody RegisterAdvisorRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Kayıt başarılı.", authService.registerAdvisor(req)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Giriş başarılı.", authService.login(req)));
    }
}
