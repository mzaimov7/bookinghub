package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByCreatedAtDesc();
}
