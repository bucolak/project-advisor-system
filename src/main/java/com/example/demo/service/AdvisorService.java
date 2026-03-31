package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.enums.AdvisingStatus;
import com.example.demo.enums.RequestStatus;
import com.example.demo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdvisorService {
    private final AdvisorRepository advisorRepository;
    private final AdvisorRequestRepository advisorRequestRepository;
    private final NotificationService notificationService;

    public AdvisorService(AdvisorRepository advisorRepository,
                          AdvisorRequestRepository advisorRequestRepository,
                          NotificationService notificationService) {
        this.advisorRepository = advisorRepository;
        this.advisorRequestRepository = advisorRequestRepository;
        this.notificationService = notificationService;
    }

    public List<Advisor> getActiveAdvisors() {
        return advisorRepository.findByAdvisingStatus(AdvisingStatus.ACTIVE);
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
            User studentUser = request.getProject().getStudent().getUser();
            notificationService.createNotification(studentUser,
                    advisor.getUser().getFirstName() + " " + advisor.getUser().getLastName() +
                    " danışmanınız '" + request.getProject().getTitle() + "' projenizi kabul etti.");
        }
        return advisorRequestRepository.save(request);
    }

    public List<AdvisorRequest> getMyStudents(Long userId) {
        Advisor advisor = advisorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danışman bulunamadı."));
        return advisorRequestRepository.findByAdvisorAndStatusIn(advisor, List.of(RequestStatus.ACCEPTED));
    }
}
