package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.AdminCommentOTD;
import com.martinzaimov.bookinghub.dto.AdminBookingOTD;
import com.martinzaimov.bookinghub.dto.AdminCategoryOTD;
import com.martinzaimov.bookinghub.dto.AdminCategoryRequest;
import com.martinzaimov.bookinghub.dto.AdminDeleteServiceRequest;
import com.martinzaimov.bookinghub.dto.AdminHideCommentRequest;
import com.martinzaimov.bookinghub.dto.AdminReportActionRequest;
import com.martinzaimov.bookinghub.dto.AdminReportOTD;
import com.martinzaimov.bookinghub.dto.AdminReviewServiceRequest;
import com.martinzaimov.bookinghub.dto.AdminReviewOTD;
import com.martinzaimov.bookinghub.dto.AdminUserStatusRequest;
import com.martinzaimov.bookinghub.dto.AdminUserProfileOTD;
import com.martinzaimov.bookinghub.dto.ServiceOTD;
import com.martinzaimov.bookinghub.service.AdminPortalService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminPortalController {

    private final AdminPortalService adminPortalService;

    public AdminPortalController(AdminPortalService adminPortalService) {
        this.adminPortalService = adminPortalService;
    }

    @GetMapping("/services")
    public List<ServiceOTD> getServices(@RequestHeader("X-Admin-User-Id") Long adminUserId) {
        return adminPortalService.getServices(adminUserId);
    }

    @GetMapping("/bookings")
    public List<AdminBookingOTD> getBookings(@RequestHeader("X-Admin-User-Id") Long adminUserId) {
        return adminPortalService.getBookings(adminUserId);
    }

    @GetMapping("/categories")
    public List<AdminCategoryOTD> getCategories(@RequestHeader("X-Admin-User-Id") Long adminUserId) {
        return adminPortalService.getCategories(adminUserId);
    }

    @PostMapping("/categories")
    public AdminCategoryOTD createCategory(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @Valid @RequestBody AdminCategoryRequest request
    ) {
        return adminPortalService.createCategory(adminUserId, request);
    }

    @PutMapping("/categories/{categoryId}")
    public AdminCategoryOTD updateCategory(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long categoryId,
            @Valid @RequestBody AdminCategoryRequest request
    ) {
        return adminPortalService.updateCategory(adminUserId, categoryId, request);
    }

    @PatchMapping("/categories/{categoryId}/deactivate")
    public AdminCategoryOTD deactivateCategory(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long categoryId
    ) {
        return adminPortalService.deactivateCategory(adminUserId, categoryId);
    }

    @PatchMapping("/services/{serviceId}/approve")
    public ServiceOTD approveService(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long serviceId,
            @Valid @RequestBody AdminReviewServiceRequest request
    ) {
        return adminPortalService.approveService(adminUserId, serviceId, request);
    }

    @PatchMapping("/services/{serviceId}/reject")
    public ServiceOTD rejectService(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long serviceId,
            @Valid @RequestBody AdminReviewServiceRequest request
    ) {
        return adminPortalService.rejectService(adminUserId, serviceId, request);
    }

    @PatchMapping("/services/{serviceId}/delete")
    public ServiceOTD deleteService(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long serviceId,
            @Valid @RequestBody AdminDeleteServiceRequest request
    ) {
        return adminPortalService.deleteService(adminUserId, serviceId, request);
    }

    @GetMapping("/comments")
    public List<AdminCommentOTD> getComments(@RequestHeader("X-Admin-User-Id") Long adminUserId) {
        return adminPortalService.getComments(adminUserId);
    }

    @GetMapping("/reviews")
    public List<AdminReviewOTD> getReviews(@RequestHeader("X-Admin-User-Id") Long adminUserId) {
        return adminPortalService.getReviews(adminUserId);
    }

    @PatchMapping("/reviews/{reviewId}/hide")
    public AdminReviewOTD hideReview(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long reviewId,
            @Valid @RequestBody AdminHideCommentRequest request
    ) {
        return adminPortalService.hideReview(adminUserId, reviewId, request);
    }

    @PatchMapping("/reviews/{reviewId}/restore")
    public AdminReviewOTD restoreReview(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long reviewId
    ) {
        return adminPortalService.restoreReview(adminUserId, reviewId);
    }

    @GetMapping("/reports")
    public List<AdminReportOTD> getReports(@RequestHeader("X-Admin-User-Id") Long adminUserId) {
        return adminPortalService.getReports(adminUserId);
    }

    @PatchMapping("/reports/{reportId}")
    public AdminReportOTD updateReportStatus(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long reportId,
            @Valid @RequestBody AdminReportActionRequest request
    ) {
        return adminPortalService.updateReportStatus(adminUserId, reportId, request);
    }

    @PatchMapping("/comments/{commentId}/hide")
    public AdminCommentOTD hideComment(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long commentId,
            @Valid @RequestBody AdminHideCommentRequest request
    ) {
        return adminPortalService.hideComment(adminUserId, commentId, request);
    }

    @PatchMapping("/comments/{commentId}/restore")
    public AdminCommentOTD restoreComment(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long commentId
    ) {
        return adminPortalService.restoreComment(adminUserId, commentId);
    }

    @GetMapping("/users/clients")
    public List<AdminUserProfileOTD> getClientProfiles(@RequestHeader("X-Admin-User-Id") Long adminUserId) {
        return adminPortalService.getClientProfiles(adminUserId);
    }

    @GetMapping("/users/businesses")
    public List<AdminUserProfileOTD> getBusinessProfiles(@RequestHeader("X-Admin-User-Id") Long adminUserId) {
        return adminPortalService.getBusinessProfiles(adminUserId);
    }

    @PatchMapping("/users/{userId}/status")
    public AdminUserProfileOTD updateUserStatus(
            @RequestHeader("X-Admin-User-Id") Long adminUserId,
            @PathVariable Long userId,
            @Valid @RequestBody AdminUserStatusRequest request
    ) {
        return adminPortalService.updateUserStatus(adminUserId, userId, request);
    }
}
