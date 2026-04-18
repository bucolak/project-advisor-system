package com.example.demo.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.response.AdvisorProfileResponse;
import com.example.demo.entity.Advisor;
import com.example.demo.entity.User;
import com.example.demo.repository.AdvisorRepository;
import com.example.demo.repository.UserRepository;

@Service
public class AdvisorService {

    private final AdvisorRepository advisorRepository;
    private final UserRepository userRepository;

    public AdvisorService(AdvisorRepository advisorRepository, UserRepository userRepository) {
        this.advisorRepository = advisorRepository;
        this.userRepository = userRepository;
    }

    public AdvisorProfileResponse getAdvisorProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        Advisor advisor = advisorRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Advisor profile not found."));

        return new AdvisorProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                advisor.getTitle(),
                advisor.getDepartment(),
                advisor.getAreasOfExpertise(),
                advisor.getCurrentQuota(),
                advisor.getMaxQuota(),
                advisor.getAdvisingStatus().name()
        );
    }
}
