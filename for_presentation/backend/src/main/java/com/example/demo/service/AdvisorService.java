package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entity.Advisor;
import com.example.demo.entity.AdvisorRequest;
import com.example.demo.enums.RequestStatus;
import com.example.demo.repository.AdvisorRepository;
import com.example.demo.repository.AdvisorRequestRepository;

@Service
public class AdvisorService {
    private final AdvisorRepository advisorRepository;
    private final AdvisorRequestRepository advisorRequestRepository;

    public AdvisorService(AdvisorRepository advisorRepository,
                          AdvisorRequestRepository advisorRequestRepository) {
        this.advisorRepository = advisorRepository;
        this.advisorRequestRepository = advisorRequestRepository;
    }

    public List<AdvisorRequest> getPendingRequests(Long userId) {
        Advisor advisor = advisorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danışman bulunamadı."));
        return advisorRequestRepository.findByAdvisorAndStatus(advisor, RequestStatus.PENDING);
    }

    @Transactional
    public AdvisorRequest updateRequestStatus(Long userId, Long requestId, String status) {
        Advisor advisor = advisorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danışman bulunamadı."));
        AdvisorRequest request = advisorRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "İstek bulunamadı."));
        if (!request.getAdvisor().getUserId().equals(advisor.getUserId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu istek size ait değil.");
        RequestStatus newStatus = RequestStatus.valueOf(status.toUpperCase());
        request.setStatus(newStatus);
        request.setResponseDate(LocalDateTime.now());
        if (newStatus == RequestStatus.ACCEPTED) {
            List<AdvisorRequest> otherRequests = advisorRequestRepository
                    .findByProjectAndStatus(request.getProject(), RequestStatus.PENDING);
            for (AdvisorRequest other : otherRequests)
                if (!other.getId().equals(request.getId())) {
                    other.setStatus(RequestStatus.CANCELED);
                    advisorRequestRepository.save(other);
                }
            advisor.setCurrentQuota(advisor.getCurrentQuota() + 1);
            advisorRepository.save(advisor);
        }
        return advisorRequestRepository.save(request);
    }
}
