package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Project;
import com.example.demo.entity.Student;
import com.example.demo.enums.ProjectStatus;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStudentAndIsDeletedFalse(Student student);

    List<Project> findByIsDeletedFalse();

    long countByIsDeletedFalse();

    @Query("""
           SELECT p
           FROM Project p
           WHERE p.status = :status
             AND p.isDeleted = false
             AND p.student <> :student
           """)
    List<Project> findOpenProjectsExceptCurrentStudent(
            @Param("status") ProjectStatus status,
            @Param("student") Student student
    );
}
