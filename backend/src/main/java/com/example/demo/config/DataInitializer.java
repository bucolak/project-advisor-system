package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.entity.ProjectCategory;
import com.example.demo.entity.Student;
import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.ProjectCategoryRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initUsers(
            UserRepository userRepository,
            StudentRepository studentRepository,
            ProjectCategoryRepository projectCategoryRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            /*
             -------------------------
             DEFAULT STUDENT
             -------------------------
             */
            User studentUser
                    = userRepository.findByEmail("sude@uskudar.com")
                            .orElseGet(() -> {

                                User newUser = User.builder()
                                        .email("sude@uskudar.com")
                                        .passwordHash(
                                                passwordEncoder.encode("1234")
                                        )
                                        .role(Role.STUDENT)
                                        .firstName("Sude")
                                        .lastName("Torun")
                                        .status(UserStatus.ACTIVE)
                                        .isDeleted(false)
                                        .build();

                                return userRepository.save(newUser);
                            });

            if (!studentRepository.existsById(studentUser.getId())) {

                Student student = Student.builder()
                        .user(studentUser)
                        .department("Software Engineering")
                        .year(3)
                        .gpa(3.66)
                        .skills(
                                "Web Development, Robotics, Embedded systems, "
                                + "Signal processing, Control, IoT, Cyber Security, NLP"
                        )
                        .githubLink("")
                        .linkedinLink("")
                        .build();

                studentRepository.save(student);
            }


            /*
             -------------------------
             DEFAULT ADVISOR
             -------------------------
             */
            if (!userRepository.existsByEmail("zeynep@uskudar.com")) {

                User advisor = User.builder()
                        .email("zeynep@uskudar.com")
                        .passwordHash(
                                passwordEncoder.encode("1234")
                        )
                        .role(Role.ADVISOR)
                        .firstName("Zeynep")
                        .lastName("Pınarlı")
                        .status(UserStatus.ACTIVE)
                        .isDeleted(false)
                        .build();

                userRepository.save(advisor);
            }

            /*
             -------------------------
             DEFAULT ADMIN
             -------------------------
             */
            if (!userRepository.existsByEmail("buket@uskudar.com")) {

                User admin = User.builder()
                        .email("buket@uskudar.com")
                        .passwordHash(
                                passwordEncoder.encode("1234")
                        )
                        .role(Role.ADMIN)
                        .firstName("Buket")
                        .lastName("Çolak")
                        .status(UserStatus.ACTIVE)
                        .isDeleted(false)
                        .build();

                userRepository.save(admin);
            }

            /*
             -------------------------
             DEFAULT PROJECT CATEGORIES
             -------------------------
             */
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
