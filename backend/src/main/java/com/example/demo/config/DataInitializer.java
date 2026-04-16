package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> {

            if (!userRepository.existsByEmail("sude@uskudar.com")) {
                User student = User.builder()
                        .email("sude@uskudar.com")
                        .passwordHash(passwordEncoder.encode("1234"))
                        .role(Role.STUDENT)
                        .status(UserStatus.ACTIVE)
                        .isDeleted(false)
                        .build();

                userRepository.save(student);
            }

            if (!userRepository.existsByEmail("zeynep@uskudar.com")) {
                User advisor = User.builder()
                        .email("zeynep@uskudar.com")
                        .passwordHash(passwordEncoder.encode("1234"))
                        .role(Role.ADVISOR)
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
                        .status(UserStatus.ACTIVE)
                        .isDeleted(false)
                        .build();

                userRepository.save(admin);
            }
        };
    }
}