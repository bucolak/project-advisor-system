package com.example.demo.repository;

import com.example.demo.entity.Advisor;
import com.example.demo.enums.AdvisingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AdvisorRepository extends JpaRepository<Advisor, Long> {
    Optional<Advisor> findByUserId(Long userId);
    List<Advisor> findByAdvisingStatus(AdvisingStatus status);
}
