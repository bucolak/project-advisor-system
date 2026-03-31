package com.example.demo.repository;

import com.example.demo.entity.Advisor;
import com.example.demo.entity.AdvisorRequest;
import com.example.demo.entity.Project;
import com.example.demo.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AdvisorRequestRepository extends JpaRepository<AdvisorRequest, Long> {
    List<AdvisorRequest> findByAdvisorAndStatus(Advisor advisor, RequestStatus status);
    List<AdvisorRequest> findByProjectAndStatus(Project project, RequestStatus status);
    Optional<AdvisorRequest> findByProjectAndAdvisor(Project project, Advisor advisor);
    List<AdvisorRequest> findByAdvisorAndStatusIn(Advisor advisor, List<RequestStatus> statuses);
}
