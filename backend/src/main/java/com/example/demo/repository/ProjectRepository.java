package com.example.demo.repository;

import com.example.demo.entity.Project;
import com.example.demo.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStudentAndIsDeletedFalse(Student student);
    List<Project> findByIsDeletedFalse();
    long countByIsDeletedFalse();
}
