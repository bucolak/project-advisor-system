package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Advisor;
import com.example.demo.entity.AdvisorRequest;
import com.example.demo.entity.Project;
import com.example.demo.entity.Student;
import com.example.demo.enums.RequestStatus;

public interface AdvisorRequestRepository extends JpaRepository<AdvisorRequest, Long> {
List<AdvisorRequest> findByAdvisorAndStatusOrderByResponseDateDesc(
        Advisor advisor,
        RequestStatus status
);


    List<AdvisorRequest> findByAdvisorAndStatus(Advisor advisor, RequestStatus status);

    List<AdvisorRequest> findByAdvisorOrderByRequestDateDesc(Advisor advisor);

    List<AdvisorRequest> findByProjectAndStatus(Project project, RequestStatus status);

    Optional<AdvisorRequest> findByProjectAndAdvisor(Project project, Advisor advisor);

    List<AdvisorRequest> findByAdvisorAndStatusIn(Advisor advisor, List<RequestStatus> statuses);

    List<AdvisorRequest> findByProjectStudent(Student student);

    List<AdvisorRequest> findByProjectStudentOrderByRequestDateDesc(Student student);

    List<AdvisorRequest> findByProjectAndStatusIn(Project project, List<RequestStatus> statuses);

}
