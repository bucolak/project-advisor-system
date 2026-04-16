package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        return ResponseEntity.ok(ApiResponse.ok("Student profile fetched.", profile));
    }
}