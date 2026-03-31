package com.example.demo.repository;

import com.example.demo.entity.Announcement;
import com.example.demo.enums.AnnouncementTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByTargetRoleIn(List<AnnouncementTarget> targets);
}
