package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.entity.Advisor;
import com.example.demo.entity.ProjectCategory;
import com.example.demo.entity.Student;
import com.example.demo.entity.User;
import com.example.demo.enums.AdvisingStatus;
import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.AdvisorRepository;
import com.example.demo.repository.ProjectCategoryRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initUsers(
            UserRepository userRepository,
            StudentRepository studentRepository,
            AdvisorRepository advisorRepository,
            ProjectCategoryRepository projectCategoryRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            User studentUser = userRepository.findByEmail("sude@uskudar.com")
                    .orElseGet(() -> userRepository.save(
                    User.builder()
                            .email("sude@uskudar.com")
                            .passwordHash(passwordEncoder.encode("1234"))
                            .role(Role.STUDENT)
                            .firstName("Sude")
                            .lastName("Torun")
                            .status(UserStatus.ACTIVE)
                            .isDeleted(false)
                            .build()
            ));

            if (!studentRepository.existsById(studentUser.getId())) {
                studentRepository.save(
                        Student.builder()
                                .user(studentUser)
                                .department("Software Engineering")
                                .year(3)
                                .gpa(3.66)
                                .skills("Web Development, Robotics, Embedded systems, Signal processing, Control, IoT, Cyber Security, NLP")
                                .githubLink("")
                                .linkedinLink("")
                                .build()
                );
            }

            User advisorUser = userRepository.findByEmail("zeynep@uskudar.com")
                    .orElseGet(() -> userRepository.save(
                    User.builder()
                            .email("zeynep@uskudar.com")
                            .passwordHash(passwordEncoder.encode("1234"))
                            .role(Role.ADVISOR)
                            .firstName("Zeynep")
                            .lastName("Pınarlı")
                            .status(UserStatus.ACTIVE)
                            .isDeleted(false)
                            .build()
            ));

            if (!advisorRepository.existsById(advisorUser.getId())) {
                advisorRepository.save(
                        Advisor.builder()
                                .user(advisorUser)
                                .title("Assistant Professor")
                                .department("Software Engineering")
                                .areasOfExpertise("Web Development, NLP, Embedded Systems")
                                .currentQuota(0)
                                .maxQuota(5)
                                .advisingStatus(AdvisingStatus.ACTIVE)
                                .build()
                );
            }

            userRepository.findByEmail("buket@uskudar.com")
                    .orElseGet(() -> userRepository.save(
                    User.builder()
                            .email("buket@uskudar.com")
                            .passwordHash(passwordEncoder.encode("1234"))
                            .role(Role.ADMIN)
                            .firstName("Buket")
                            .lastName("Çolak")
                            .status(UserStatus.ACTIVE)
                            .isDeleted(false)
                            .build()
            ));

            if (!projectCategoryRepository.existsByName("TÜBİTAK")) {
                projectCategoryRepository.save(
                        ProjectCategory.builder()
                                .name("TÜBİTAK")
                                .advisorRequired(true)
                                .build()
                );
            }

            if (!projectCategoryRepository.existsByName("TEKNOFEST")) {
                projectCategoryRepository.save(
                        ProjectCategory.builder()
                                .name("TEKNOFEST")
                                .advisorRequired(true)
                                .build()
                );
            }

            if (!projectCategoryRepository.existsByName("COURSE")) {
                projectCategoryRepository.save(
                        ProjectCategory.builder()
                                .name("COURSE")
                                .advisorRequired(false)
                                .build()
                );
            }
        };
    }
}
