package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;

import com.example.demo.entity.Advisor;
import com.example.demo.entity.AnnouncementType;
import com.example.demo.entity.ProjectCategory;
import com.example.demo.entity.Student;
import com.example.demo.entity.User;
import com.example.demo.enums.AdvisingStatus;
import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.AdvisorRepository;
import com.example.demo.repository.AnnouncementTypeRepository;
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
            AnnouncementTypeRepository announcementTypeRepository,
            PasswordEncoder passwordEncoder,
            TransactionTemplate transactionTemplate
    ) {
        return args -> transactionTemplate.executeWithoutResult(status -> {

            // ================= Sude =================
            User sudeUser = userRepository.findByEmail("sude@student.com")
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .email("sude@student.com")
                                    .passwordHash(passwordEncoder.encode("1234"))
                                    .role(Role.STUDENT)
                                    .firstName("Sude")
                                    .lastName("Torun")
                                    .status(UserStatus.ACTIVE)
                                    .isDeleted(false)
                                    .build()
                    ));

            if (!studentRepository.existsById(sudeUser.getId())) {
                studentRepository.save(
                        Student.builder()
                                .user(sudeUser)
                                .department("Software Engineering")
                                .year(3)
                                .gpa(3.66)
                                .skills("Web Development, Robotics, NLP")
                                .relevantCourses("Database Systems, Web Programming, OOP")
                                .researchInterests("AI, Robotics, NLP")
                                .githubLink("")
                                .linkedinLink("")
                                .build()
                );
            }

            // ================= Nida =================
            User nidaUser = userRepository.findByEmail("nida@student.com")
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .email("nida@student.com")
                                    .passwordHash(passwordEncoder.encode("1234"))
                                    .role(Role.STUDENT)
                                    .firstName("Nida")
                                    .lastName("Çamlıca")
                                    .status(UserStatus.ACTIVE)
                                    .isDeleted(false)
                                    .build()
                    ));

            if (!studentRepository.existsById(nidaUser.getId())) {
                studentRepository.save(
                        Student.builder()
                                .user(nidaUser)
                                .department("Software Engineering")
                                .year(2)
                                .gpa(3.20)
                                .skills("Java, Spring Boot, SQL")
                                .relevantCourses("Java Programming, Databases")
                                .researchInterests("Backend Development, Web Systems")
                                .githubLink("")
                                .linkedinLink("")
                                .build()
                );
            }
            User melisUser = userRepository.findByEmail("melis@student.com")
                    .orElseGet(() -> userRepository.save(
                    User.builder()
                            .email("melis@student.com")
                            .passwordHash(passwordEncoder.encode("1234"))
                            .role(Role.STUDENT)
                            .firstName("Melis")
                            .lastName("Yıldırım")
                            .status(UserStatus.ACTIVE)
                            .isDeleted(false)
                            .build()
            ));

            if (!studentRepository.existsById(melisUser.getId())) {

                studentRepository.save(
                        Student.builder()
                                .user(melisUser)
                                .department("Software Engineering")
                                .year(3)
                                .gpa(3.58)
                                .skills("Spring Boot, React, PostgreSQL")
                                .relevantCourses("Software Architecture, Web Programming, Database Systems")
                                .researchInterests("Full Stack Development, Cloud Systems, UI Design")
                                .githubLink("")
                                .linkedinLink("")
                                .build()
                );

            }
            // ================= Zeynep Advisor =================
            User zeynepUser = userRepository.findByEmail("zeynep@advisor.com")
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .email("zeynep@advisor.com")
                                    .passwordHash(passwordEncoder.encode("1234"))
                                    .role(Role.ADVISOR)
                                    .firstName("Zeynep")
                                    .lastName("Pınarlı")
                                    .status(UserStatus.ACTIVE)
                                    .isDeleted(false)
                                    .build()
                    ));

            if (!advisorRepository.existsById(zeynepUser.getId())) {
                advisorRepository.save(
                        Advisor.builder()
                                .user(zeynepUser)
                                .title("Assistant Professor")
                                .department("Software Engineering")
                                .areasOfExpertise("Web Development, NLP, Embedded Systems")
                                .currentQuota(0)
                                .maxQuota(5)
                                .advisingStatus(AdvisingStatus.ACTIVE)
                                .build()
                );
            }

            // ================= Ayşe Advisor =================
            User ayseUser = userRepository.findByEmail("ayse@advisor.com")
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .email("ayse@advisor.com")
                                    .passwordHash(passwordEncoder.encode("1234"))
                                    .role(Role.ADVISOR)
                                    .firstName("Ayşe")
                                    .lastName("Demir")
                                    .status(UserStatus.ACTIVE)
                                    .isDeleted(false)
                                    .build()
                    ));

            if (!advisorRepository.existsById(ayseUser.getId())) {
                advisorRepository.save(
                        Advisor.builder()
                                .user(ayseUser)
                                .title("Assistant Professor")
                                .department("Software Engineering")
                                .areasOfExpertise("Artificial Intelligence, Machine Learning, Data Science")
                                .currentQuota(0)
                                .maxQuota(5)
                                .advisingStatus(AdvisingStatus.ACTIVE)
                                .build()
                );
            }

            // ================= Mehmet Advisor (FULL QUOTA TEST) =================
            User mehmetUser = userRepository.findByEmail("mehmet@advisor.com")
                    .orElseGet(() -> userRepository.save(
                    User.builder()
                            .email("mehmet@advisor.com")
                            .passwordHash(passwordEncoder.encode("1234"))
                            .role(Role.ADVISOR)
                            .firstName("Mehmet")
                            .lastName("Kaya")
                            .status(UserStatus.ACTIVE)
                            .isDeleted(false)
                            .build()
            ));

            if (!advisorRepository.existsById(mehmetUser.getId())) {
                advisorRepository.save(
                        Advisor.builder()
                                .user(mehmetUser)
                                .title("Professor")
                                .department("Software Engineering")
                                .areasOfExpertise("AI, Cyber Security, Distributed Systems")
                                .researchInterests("Machine Learning, Deep Learning")
                                .currentQuota(0)
                                .maxQuota(5)
                                .advisingStatus(AdvisingStatus.ACTIVE)
                                .build()
                );
            }
// ================= Ece Advisor =================
            User eceUser = userRepository.findByEmail("ece@advisor.com")
                    .orElseGet(() -> userRepository.save(
                    User.builder()
                            .email("ece@advisor.com")
                            .passwordHash(passwordEncoder.encode("1234"))
                            .role(Role.ADVISOR)
                            .firstName("Ece")
                            .lastName("Karaca")
                            .status(UserStatus.ACTIVE)
                            .isDeleted(false)
                            .build()
            ));

            if (!advisorRepository.existsById(eceUser.getId())) {
                advisorRepository.save(
                        Advisor.builder()
                                .user(eceUser)
                                .title("Associate Professor")
                                .department("Software Engineering")
                                .areasOfExpertise("Cyber Security, Networks, Cloud Systems")
                                .researchInterests("Cyber Security, Distributed Systems")
                                .currentQuota(0)
                                .maxQuota(5)
                                .advisingStatus(AdvisingStatus.ACTIVE)
                                .build()
                );
            }
            // ================= Admin =================
            userRepository.findByEmail("buket@admin.com")
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .email("buket@admin.com")
                                    .passwordHash(passwordEncoder.encode("1234"))
                                    .role(Role.ADMIN)
                                    .firstName("Buket")
                                    .lastName("Çolak")
                                    .status(UserStatus.ACTIVE)
                                    .isDeleted(false)
                                    .build()
                    ));

            // ================= Categories =================
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

            // ================= Announcement Types =================
            if (!announcementTypeRepository.existsByName("TÜBİTAK Application Deadlines")) {
                announcementTypeRepository.save(
                        AnnouncementType.builder()
                                .name("TÜBİTAK Application Deadlines")
                                .build()
                );
            }

            if (!announcementTypeRepository.existsByName("TEKNOFEST Application Deadlines")) {
                announcementTypeRepository.save(
                        AnnouncementType.builder()
                                .name("TEKNOFEST Application Deadlines")
                                .build()
                );
            }

            if (!announcementTypeRepository.existsByName("Evaluation Dates")) {
                announcementTypeRepository.save(
                        AnnouncementType.builder()
                                .name("Evaluation Dates")
                                .build()
                );
            }

            if (!announcementTypeRepository.existsByName("Result Announcement Dates")) {
                announcementTypeRepository.save(
                        AnnouncementType.builder()
                                .name("Result Announcement Dates")
                                .build()
                );
            }

        });
    }
}