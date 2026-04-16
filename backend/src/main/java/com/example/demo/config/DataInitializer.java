package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.entity.Student;
import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository,
                                       StudentRepository studentRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> {

            if (!userRepository.existsByEmail("sude@uskudar.com")) {
                User studentUser = User.builder()
                        .email("sude@uskudar.com")
                        .passwordHash(passwordEncoder.encode("1234"))
                        .role(Role.STUDENT)
                        .firstName("Sude")
                        .lastName("Torun")
                        .status(UserStatus.ACTIVE)
                        .isDeleted(false)
                        .build();

                userRepository.save(studentUser);

                Student student = Student.builder()
                        .user(studentUser)
                        .department("Software Engineering")
                        .year(3)
                        .gpa(3.66)
                        .skills("Web Development, Robotics, Embedded systems, Signal processing, Control, IoT, Cyber Security, NLP")
                        .githubLink("")
                        .linkedinLink("")
                        .build();

                studentRepository.save(student);
            }

            if (!userRepository.existsByEmail("zeynep@uskudar.com")) {
                User advisor = User.builder()
                        .email("zeynep@uskudar.com")
                        .passwordHash(passwordEncoder.encode("1234"))
                        .role(Role.ADVISOR)
                        .firstName("Zeynep")
                        .lastName("Pınarlı")
                        .status(UserStatus.ACTIVE)
                        .isDeleted(false)
                        .build();

                userRepository.save(advisor);
            }

            if (!userRepository.existsByEmail("buket@uskudar.com")) {
                User admin = User.builder()
                        .email("buket@uskudar.com")
                        .passwordHash(passwordEncoder.encode("1234"))
                        .role(Role.ADMIN)
                        .firstName("Buket")
                        .lastName("Admin")
                        .status(UserStatus.ACTIVE)
                        .isDeleted(false)
                        .build();

                userRepository.save(admin);
            }
        };
    }
}