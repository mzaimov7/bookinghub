package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.AdminReportOTD;
import com.martinzaimov.bookinghub.dto.CreateReportRequest;
import com.martinzaimov.bookinghub.entity.Comment;
import com.martinzaimov.bookinghub.entity.Report;
import com.martinzaimov.bookinghub.entity.Review;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.CommentRepository;
import com.martinzaimov.bookinghub.repo.ReportRepository;
import com.martinzaimov.bookinghub.repo.ReviewRepository;
import com.martinzaimov.bookinghub.repo.ServiceRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ReportService {

    private final ReportRepository reports;
    private final UserRepository users;
    private final CommentRepository comments;
    private final ReviewRepository reviews;
    private final ServiceRepository services;

    public ReportService(
            ReportRepository reports,
            UserRepository users,
            CommentRepository comments,
            ReviewRepository reviews,
            ServiceRepository services
    ) {
        this.reports = reports;
        this.users = users;
        this.comments = comments;
        this.reviews = reviews;
        this.services = services;
    }

    @Transactional
    public AdminReportOTD createReport(Long userId, CreateReportRequest request) {
        User reporter = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Потребителят не е намерен"));

        if (reporter.getRole() != User.Role.CLIENT && reporter.getRole() != User.Role.BUSINESS) {
            throw new ResponseStatusException(BAD_REQUEST, "Само клиентски и бизнес профили могат да подават сигнали");
        }

        Report.TargetType targetType;
        try {
            targetType = Report.TargetType.valueOf(request.targetType.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Невалиден тип на сигнала");
        }

        if (request.targetId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Липсва цел на сигнала");
        }

        String reason = normalize(request.reasonText);
        if (reason == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Причината за сигнала е задължителна");
        }

        validateTarget(reporter, targetType, request.targetId);

        Report report = new Report();
        report.setReporterUserId(userId);
        report.setTargetType(targetType);
        report.setTargetId(request.targetId);
        report.setReasonText(reason);
        report.setStatus(Report.Status.OPEN);
        LocalDateTime now = LocalDateTime.now();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);

        Report saved = reports.save(report);
        return toDto(saved, reporter);
    }

    private void validateTarget(User reporter, Report.TargetType targetType, Long targetId) {
        switch (targetType) {
            case USER -> {
                User target = users.findById(targetId)
                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Потребителят за докладване не е намерен"));
                if (target.getRole() != User.Role.CLIENT && target.getRole() != User.Role.BUSINESS) {
                    throw new ResponseStatusException(BAD_REQUEST, "Можеш да докладваш само клиентски или бизнес профили");
                }
                if (target.getId().equals(reporter.getId())) {
                    throw new ResponseStatusException(BAD_REQUEST, "Не можеш да докладваш собствения си профил");
                }
            }
            case COMMENT -> {
                Comment comment = comments.findById(targetId)
                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Коментарът за докладване не е намерен"));
                if (comment.getAuthorUserId().equals(reporter.getId())) {
                    throw new ResponseStatusException(BAD_REQUEST, "Не можеш да докладваш собствения си коментар");
                }
                services.findById(comment.getServiceId())
                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Услугата към коментара не е намерена"));
            }
            case REVIEW -> {
                Review review = reviews.findById(targetId)
                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Отзивът за докладване не е намерен"));
                if (review.getAuthorUserId().equals(reporter.getId())) {
                    throw new ResponseStatusException(BAD_REQUEST, "Не можеш да докладваш собствения си отзив");
                }
            }
            case SERVICE -> {
                com.martinzaimov.bookinghub.entity.Service service = services.findById(targetId)
                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Обявата за докладване не е намерена"));
                if (service.getBusinessUserId().equals(reporter.getId())) {
                    throw new ResponseStatusException(BAD_REQUEST, "Не можеш да докладваш собствената си обява");
                }
            }
        }
    }

    private AdminReportOTD toDto(Report report, User reporter) {
        return new AdminReportOTD(
                report.getId(),
                report.getReporterUserId(),
                reporter.getUsername(),
                report.getTargetType().name(),
                report.getTargetId(),
                resolveTargetLabel(report),
                null,
                null,
                null,
                null,
                null,
                null,
                reporter.getRole().name(),
                null,
                java.util.List.of(),
                report.getReasonText(),
                report.getStatus().name(),
                report.getResolutionNote(),
                report.getCreatedAt() == null ? null : report.getCreatedAt().toString()
        );
    }

    private String resolveTargetLabel(Report report) {
        return switch (report.getTargetType()) {
            case USER -> users.findById(report.getTargetId()).map(User::getUsername).orElse("Потребител");
            case COMMENT -> comments.findById(report.getTargetId()).map(item -> "Коментар #" + item.getId()).orElse("Коментар");
            case REVIEW -> reviews.findById(report.getTargetId()).map(item -> "Отзив #" + item.getId()).orElse("Отзив");
            case SERVICE -> services.findById(report.getTargetId()).map(com.martinzaimov.bookinghub.entity.Service::getTitle).orElse("Обява");
        };
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
