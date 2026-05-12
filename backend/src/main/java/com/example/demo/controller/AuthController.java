package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.request.LoginRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {

        try {

            return ResponseEntity.ok(
                    ApiResponse.ok("Login successful.", authService.login(req))
            );

        } catch (ResponseStatusException e) {

            String message = e.getReason();

            if (message == null || message.isBlank()) {
                message = "Invalid e-mail or password!";
            }

            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(Map.of(
                            "success", false,
                            "message", message
                    ));
        }
    }
}
