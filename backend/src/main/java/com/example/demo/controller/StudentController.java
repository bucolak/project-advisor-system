package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.StudentProfileResponse;
import com.example.demo.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse> getStudentProfile(@PathVariable Long userId) {
        StudentProfileResponse profile = studentService.getStudentProfile(userId);

        return ResponseEntity.ok(
                ApiResponse.ok("Student profile fetched.", profile)
        );
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> updateMyProfile(
            Authentication auth,
            @RequestBody Map<String, Object> body
    ) {
        Long userId = (Long) auth.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Student profile updated.",
                        studentService.updateStudentProfile(userId, body)
                )
        );
    }

    @PutMapping("/{userId}/profile")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<ApiResponse> updateStudentProfileById(
            Authentication auth,
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body
    ) {
        Long loggedUserId = (Long) auth.getPrincipal();

        if (!loggedUserId.equals(userId)) {
            return ResponseEntity.status(403).body(
                    ApiResponse.error("You can only update your own profile.")
            );
        }

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Student profile updated.",
                        studentService.updateStudentProfile(userId, body)
                )
        );
    }
}