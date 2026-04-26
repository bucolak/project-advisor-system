package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Project;
import com.example.demo.entity.ProjectApplication;
import com.example.demo.entity.Student;
import com.example.demo.enums.ApplicationStatus;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long> {

    Optional<ProjectApplication> findByProjectAndStudent(Project project, Student student);

    List<ProjectApplication> findByStudent(Student student);

    List<ProjectApplication> findByStudentAndStatus(Student student, ApplicationStatus status);

    List<ProjectApplication> findByProjectStudent(Student projectOwner);

    List<ProjectApplication> findByProjectStudentAndStatus(Student projectOwner, ApplicationStatus status);
}
