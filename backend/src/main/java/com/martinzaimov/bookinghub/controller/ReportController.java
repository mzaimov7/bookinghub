package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.CreateReportRequest;
import com.martinzaimov.bookinghub.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateReportRequest request
    ) {
        return ResponseEntity.ok(reportService.createReport(userId, request));
    }
}
