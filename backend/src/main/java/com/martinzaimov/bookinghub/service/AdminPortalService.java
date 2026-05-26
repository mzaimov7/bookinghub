package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.*;
import com.martinzaimov.bookinghub.entity.Booking;
import com.martinzaimov.bookinghub.entity.BusinessProfile;
import com.martinzaimov.bookinghub.entity.Category;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.Comment;
import com.martinzaimov.bookinghub.entity.Report;
import com.martinzaimov.bookinghub.entity.Resource;
import com.martinzaimov.bookinghub.entity.ResourceSlot;
import com.martinzaimov.bookinghub.entity.Review;
import com.martinzaimov.bookinghub.entity.Service;
import com.martinzaimov.bookinghub.entity.ServiceImage;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.*;
import jakarta.transaction.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@org.springframework.stereotype.Service
public class AdminPortalService {

    private final UserRepository users;
    private final ServiceRepository services;
    private final ServiceImageRepository serviceImages;
    private final ServiceResourceDao serviceResourceDao;
    private final BookingRepository bookings;
    private final CommentRepository comments;
    private final ReviewRepository reviews;
    private final ReportRepository reports;
    private final ClientProfileRepository clientProfiles;
    private final BusinessProfileRepository businessProfiles;
    private final ResourceRepository resources;
    private final ResourceSlotRepository slots;
    private final CategoryRepository categories;
    private final EmailService emailService;

    public AdminPortalService(
            UserRepository users,
            ServiceRepository services,
            ServiceImageRepository serviceImages,
            ServiceResourceDao serviceResourceDao,
            BookingRepository bookings,
            CommentRepository comments,
            ReviewRepository reviews,
            ReportRepository reports,
            ClientProfileRepository clientProfiles,
            BusinessProfileRepository businessProfiles,
            ResourceRepository resources,
            ResourceSlotRepository slots,
            CategoryRepository categories,
            EmailService emailService
    ) {
        this.users = users;
        this.services = services;
        this.serviceImages = serviceImages;
        this.serviceResourceDao = serviceResourceDao;
        this.bookings = bookings;
        this.comments = comments;
        this.reviews = reviews;
        this.reports = reports;
        this.clientProfiles = clientProfiles;
        this.businessProfiles = businessProfiles;
        this.resources = resources;
        this.slots = slots;
        this.categories = categories;
        this.emailService = emailService;
    }

    public List<ServiceOTD> getServices(Long adminUserId) {
        requireAdminUser(adminUserId);
        return services.findAllByOrderByIdDesc()
                .stream()
                .map(this::toServiceDto)
                .toList();
    }

    public List<AdminBookingOTD> getBookings(Long adminUserId) {
        requireAdminUser(adminUserId);
        return bookings.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toAdminBookingDto)
                .toList();
    }

    public List<AdminCategoryOTD> getCategories(Long adminUserId) {
        requireAdminUser(adminUserId);
        return categories.findAllByOrderByNameAsc()
                .stream()
                .map((category) -> new AdminCategoryOTD(category.getId(), category.getName(), category.getDescription(), category.isActive()))
                .toList();
    }

    @Transactional
    public AdminCategoryOTD createCategory(Long adminUserId, AdminCategoryRequest request) {
        requireAdminUser(adminUserId);
        String name = normalize(request.name);
        if (name == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Category name is required");
        }
        if (categories.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(BAD_REQUEST, "A category with that name already exists");
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(normalize(request.description));
        category.setActive(request.active == null || request.active);
        Category saved = categories.save(category);
        return new AdminCategoryOTD(saved.getId(), saved.getName(), saved.getDescription(), saved.isActive());
    }

    @Transactional
    public AdminCategoryOTD updateCategory(Long adminUserId, Long categoryId, AdminCategoryRequest request) {
        requireAdminUser(adminUserId);
        Category category = categories.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));

        String name = normalize(request.name);
        if (name == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Category name is required");
        }
        if (!category.getName().equalsIgnoreCase(name) && categories.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(BAD_REQUEST, "A category with that name already exists");
        }

        category.setName(name);
        category.setDescription(normalize(request.description));
        if (request.active != null) {
            category.setActive(request.active);
        }
        Category saved = categories.save(category);
        return new AdminCategoryOTD(saved.getId(), saved.getName(), saved.getDescription(), saved.isActive());
    }

    @Transactional
    public AdminCategoryOTD deactivateCategory(Long adminUserId, Long categoryId) {
        requireAdminUser(adminUserId);
        Category category = categories.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Category not found"));
        category.setActive(false);
        Category saved = categories.save(category);
        return new AdminCategoryOTD(saved.getId(), saved.getName(), saved.getDescription(), saved.isActive());
    }

    @Transactional
    public ServiceOTD approveService(Long adminUserId, Long serviceId, AdminReviewServiceRequest request) {
        requireAdminUser(adminUserId);
        Service service = services.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        service.setApprovalStatus(Service.ApprovalStatus.APPROVED);
        service.setApprovalNote(normalize(request.note));
        service.setApprovalReviewedByUserId(adminUserId);
        service.setApprovalReviewedAt(LocalDateTime.now());
        service.setActive(true);
        services.save(service);
        return toServiceDto(service);
    }

    @Transactional
    public ServiceOTD rejectService(Long adminUserId, Long serviceId, AdminReviewServiceRequest request) {
        requireAdminUser(adminUserId);
        String note = normalize(request.note);
        if (note == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Rejection note is required");
        }

        Service service = services.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        service.setApprovalStatus(Service.ApprovalStatus.REJECTED);
        service.setApprovalNote(note);
        service.setApprovalReviewedByUserId(adminUserId);
        service.setApprovalReviewedAt(LocalDateTime.now());
        service.setActive(false);
        services.save(service);
        return toServiceDto(service);
    }

    @Transactional
    public ServiceOTD deleteService(Long adminUserId, Long serviceId, AdminDeleteServiceRequest request) {
        requireAdminUser(adminUserId);

        String reason = normalize(request.reason);
        if (reason == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Deletion reason is required");
        }

        Service service = services.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        service.setActive(false);
        service.setApprovalStatus(Service.ApprovalStatus.REJECTED);
        service.setApprovalNote(reason);
        service.setApprovalReviewedByUserId(adminUserId);
        service.setApprovalReviewedAt(LocalDateTime.now());
        service.setAdminDeletionReason(reason);
        service.setAdminDeletedByUserId(adminUserId);
        service.setAdminDeletedAt(LocalDateTime.now());
        services.save(service);

        cancelFutureBookingsForDeletedService(serviceId, reason);
        return toServiceDto(service);
    }

    public List<AdminCommentOTD> getComments(Long adminUserId) {
        requireAdminUser(adminUserId);
        return comments.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toAdminCommentDto)
                .toList();
    }

    public List<AdminReviewOTD> getReviews(Long adminUserId) {
        requireAdminUser(adminUserId);
        return reviews.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toAdminReviewDto)
                .toList();
    }

    @Transactional
    public AdminReviewOTD hideReview(Long adminUserId, Long reviewId, AdminHideCommentRequest request) {
        requireAdminUser(adminUserId);
        String reason = normalize(request.reason);
        if (reason == null) {
            throw new ResponseStatusException(BAD_REQUEST, "A moderation reason is required");
        }
        Review review = reviews.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Review not found"));
        review.setStatus(Review.Status.HIDDEN);
        reviews.save(review);
        users.findById(review.getAuthorUserId()).ifPresent(author ->
                emailService.send(
                        author.getEmail(),
                        "Отзивът ти беше скрит",
                        "Администратор скри твой отзив в BookingHub.\n\nПричина: " + reason
                )
        );
        return toAdminReviewDto(review);
    }

    @Transactional
    public AdminReviewOTD restoreReview(Long adminUserId, Long reviewId) {
        requireAdminUser(adminUserId);
        Review review = reviews.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Review not found"));
        review.setStatus(Review.Status.VISIBLE);
        reviews.save(review);
        return toAdminReviewDto(review);
    }

    public List<AdminReportOTD> getReports(Long adminUserId) {
        requireAdminUser(adminUserId);
        return reports.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toAdminReportDto)
                .toList();
    }

    @Transactional
    public AdminReportOTD updateReportStatus(Long adminUserId, Long reportId, AdminReportActionRequest request) {
        requireAdminUser(adminUserId);
        Report report = reports.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Report not found"));

        try {
            report.setStatus(Report.Status.valueOf(request.status.trim().toUpperCase()));
        } catch (Exception exception) {
            throw new ResponseStatusException(BAD_REQUEST, "Unsupported report status");
        }
        report.setResolutionNote(normalize(request.resolutionNote));
        report.setResolvedByUserId(adminUserId);
        reports.save(report);
        return toAdminReportDto(report);
    }

    @Transactional
    public AdminCommentOTD hideComment(Long adminUserId, Long commentId, AdminHideCommentRequest request) {
        requireAdminUser(adminUserId);
        String reason = normalize(request.reason);
        if (reason == null) {
            throw new ResponseStatusException(BAD_REQUEST, "A moderation reason is required");
        }

        Comment comment = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Comment not found"));

        comment.setStatus(Comment.Status.HIDDEN);
        comment.setAdminModerationReason(reason);
        comment.setAdminModeratedByUserId(adminUserId);
        comment.setAdminModeratedAt(LocalDateTime.now());
        comments.save(comment);
        users.findById(comment.getAuthorUserId()).ifPresent(author ->
                emailService.send(
                        author.getEmail(),
                        "Коментарът ти беше скрит",
                        "Администратор скри твой коментар в BookingHub.\n\nПричина: " + reason
                )
        );

        return toAdminCommentDto(comment);
    }

    @Transactional
    public AdminCommentOTD restoreComment(Long adminUserId, Long commentId) {
        requireAdminUser(adminUserId);
        Comment comment = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Comment not found"));

        comment.setStatus(Comment.Status.VISIBLE);
        comment.setAdminModerationReason(null);
        comment.setAdminModeratedByUserId(null);
        comment.setAdminModeratedAt(null);
        comments.save(comment);
        return toAdminCommentDto(comment);
    }

    public List<AdminUserProfileOTD> getClientProfiles(Long adminUserId) {
        requireAdminUser(adminUserId);
        return users.findAllByRoleOrderByIdDesc(User.Role.CLIENT)
                .stream()
                .map(this::toClientUserDto)
                .toList();
    }

    public List<AdminUserProfileOTD> getBusinessProfiles(Long adminUserId) {
        requireAdminUser(adminUserId);
        return users.findAllByRoleOrderByIdDesc(User.Role.BUSINESS)
                .stream()
                .map(this::toBusinessUserDto)
                .toList();
    }

    @Transactional
    public AdminUserProfileOTD updateUserStatus(Long adminUserId, Long userId, AdminUserStatusRequest request) {
        requireAdminUser(adminUserId);
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        boolean wasActive = user.isActive();
        String reason = normalize(request.reason);
        if (wasActive && !request.active && reason == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Deactivation reason is required");
        }
        user.setActive(request.active);
        users.save(user);
        if (wasActive && !request.active) {
            emailService.send(
                    user.getEmail(),
                    "Профилът ти беше деактивиран",
                    "Администратор деактивира профила ти в BookingHub.\n\nПричина: " + reason
            );
        }

        if (user.getRole() == User.Role.BUSINESS) {
            return toBusinessUserDto(user);
        }
        return toClientUserDto(user);
    }

    private User requireAdminUser(Long adminUserId) {
        User user = users.findById(adminUserId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Admin user not found"));
        if (user.getRole() != User.Role.ADMIN) {
            throw new ResponseStatusException(BAD_REQUEST, "Only ADMIN accounts can use this endpoint");
        }
        return user;
    }

    private ServiceOTD toServiceDto(Service service) {
        List<ServiceImage> images = serviceImages.findByServiceIdOrderBySortOrderAsc(service.getId());
        String coverUrl = images.stream()
                .filter(ServiceImage::isCover)
                .map(ServiceImage::getImageUrl)
                .findFirst()
                .orElse(images.stream().findFirst().map(ServiceImage::getImageUrl).orElse(null));

        ServiceOTD dto = new ServiceOTD(
                service.getId(),
                service.getCategory() != null ? service.getCategory().getId() : null,
                service.getBusinessUserId(),
                service.getTitle(),
                service.getDescription(),
                service.getCity(),
                service.getAddress(),
                service.getPrice(),
                service.getDurationMinutes(),
                service.getOpensAt() == null ? null : service.getOpensAt().toString(),
                service.getClosesAt() == null ? null : service.getClosesAt().toString(),
                service.getSlotIntervalMinutes(),
                service.getBookingHorizonDays(),
                coverUrl,
                images.stream().map(ServiceImage::getImageUrl).toList(),
                serviceResourceDao.findResourceIdsByServiceId(service.getId())
        );
        dto.setActive(service.isActive());
        dto.setCategorySuggestion(service.getCategorySuggestion());
        dto.setApprovalStatus(service.getApprovalStatus() == null ? null : service.getApprovalStatus().name());
        dto.setApprovalNote(service.getApprovalNote());
        dto.setApprovalReviewedAt(service.getApprovalReviewedAt() == null ? null : service.getApprovalReviewedAt().toString());
        dto.setAdminDeletionReason(service.getAdminDeletionReason());
        dto.setAdminDeletedAt(service.getAdminDeletedAt() == null ? null : service.getAdminDeletedAt().toString());
        return dto;
    }

    private AdminBookingOTD toAdminBookingDto(Booking booking) {
        Service service = services.findById(booking.getServiceId()).orElse(null);
        ResourceSlot slot = slots.findById(booking.getSlotId()).orElse(null);
        Resource resource = slot == null ? null : resources.findById(slot.getResourceId()).orElse(null);
        User client = users.findById(booking.getClientUserId()).orElse(null);
        ClientProfile clientProfile = clientProfiles.findById(booking.getClientUserId()).orElse(null);

        Long businessUserId = service != null ? service.getBusinessUserId() : null;
        BusinessProfile businessProfile = businessUserId == null ? null : businessProfiles.findById(businessUserId).orElse(null);
        String clientName = clientProfile != null
                ? (safe(clientProfile.getFirstName()) + " " + safe(clientProfile.getLastName())).trim()
                : (client != null ? safe(client.getUsername()) : "Клиент");
        if (clientName.isBlank()) {
            clientName = client != null ? safe(client.getUsername()) : "Клиент";
        }

        return new AdminBookingOTD(
                booking.getId(),
                booking.getServiceId(),
                service != null ? service.getTitle() : "Обява",
                businessUserId,
                businessProfile != null ? businessProfile.getBusinessName() : "Бизнес профил",
                booking.getClientUserId(),
                clientName,
                resource != null ? resource.getName() : "Ресурс",
                booking.getStatus().name(),
                booking.getStatusReason(),
                booking.getClientNote(),
                booking.getCreatedAt(),
                slot != null ? slot.getStartAt() : null,
                slot != null ? slot.getEndAt() : null,
                service != null ? service.getPrice() : null
        );
    }

    private AdminCommentOTD toAdminCommentDto(Comment comment) {
        Service service = services.findById(comment.getServiceId()).orElse(null);
        User author = users.findById(comment.getAuthorUserId()).orElse(null);
        ClientProfile profile = clientProfiles.findById(comment.getAuthorUserId()).orElse(null);
        String authorName = "Потребител";
        if (profile != null) {
            authorName = (safe(profile.getFirstName()) + " " + safe(profile.getLastName())).trim();
        } else if (author != null && safe(author.getUsername()) != null) {
            authorName = safe(author.getUsername());
        }
        if (authorName.isBlank()) {
            authorName = "Потребител";
        }

        return new AdminCommentOTD(
                comment.getId(),
                comment.getServiceId(),
                service != null ? service.getTitle() : "Обява",
                comment.getAuthorUserId(),
                authorName,
                comment.getText(),
                comment.getStatus().name(),
                comment.getAdminModerationReason(),
                comment.getCreatedAt() == null ? null : comment.getCreatedAt().toString(),
                comment.getAdminModeratedAt() == null ? null : comment.getAdminModeratedAt().toString()
        );
    }

    private AdminReviewOTD toAdminReviewDto(Review review) {
        Service service = services.findById(review.getServiceId()).orElse(null);
        User author = users.findById(review.getAuthorUserId()).orElse(null);
        ClientProfile profile = clientProfiles.findById(review.getAuthorUserId()).orElse(null);
        String authorName = profile != null
                ? (safe(profile.getFirstName()) + " " + safe(profile.getLastName())).trim()
                : (author != null ? safe(author.getUsername()) : "Потребител");
        if (authorName.isBlank()) {
            authorName = author != null ? safe(author.getUsername()) : "Потребител";
        }

        return new AdminReviewOTD(
                review.getId(),
                review.getBookingId(),
                review.getServiceId(),
                service != null ? service.getTitle() : "Обява",
                review.getAuthorUserId(),
                authorName,
                review.getRating(),
                review.getComment(),
                review.getStatus().name(),
                review.getCreatedAt() == null ? null : review.getCreatedAt().toString()
        );
    }

    private AdminReportOTD toAdminReportDto(Report report) {
        User reporter = users.findById(report.getReporterUserId()).orElse(null);
        String reporterName = reporter != null ? safe(reporter.getUsername()) : "Потребител";
        return new AdminReportOTD(
                report.getId(),
                report.getReporterUserId(),
                reporterName,
                report.getTargetType().name(),
                report.getTargetId(),
                resolveReportTargetLabel(report),
                resolveReportTargetText(report),
                resolveReportServiceLabel(report),
                resolveReportBusinessLabel(report),
                resolveReportServiceCoverImageUrl(report),
                resolveReportServiceId(report),
                resolveReportBusinessUserId(report),
                reporter != null ? reporter.getRole().name() : null,
                resolveReportTargetUserRole(report),
                resolveReportTargetUserListings(report),
                report.getReasonText(),
                report.getStatus().name(),
                report.getResolutionNote(),
                report.getCreatedAt() == null ? null : report.getCreatedAt().toString()
        );
    }

    private String resolveReportTargetLabel(Report report) {
        return switch (report.getTargetType()) {
            case SERVICE -> services.findById(report.getTargetId()).map(Service::getTitle).orElse("Обява");
            case USER -> resolveUserDisplayName(report.getTargetId());
            case REVIEW -> reviews.findById(report.getTargetId())
                    .flatMap((review) -> services.findById(review.getServiceId()))
                    .map(Service::getTitle)
                    .orElse("Отзив");
            case COMMENT -> comments.findById(report.getTargetId()).map((item) -> "Коментар #" + item.getId()).orElse("Коментар");
        };
    }

    private String resolveReportTargetText(Report report) {
        return switch (report.getTargetType()) {
            case REVIEW -> reviews.findById(report.getTargetId())
                    .map((item) -> safe(item.getComment()).isBlank() ? "Отзив без текст" : item.getComment())
                    .orElse(null);
            case COMMENT -> comments.findById(report.getTargetId())
                    .map(Comment::getText)
                    .orElse(null);
            default -> null;
        };
    }

    private String resolveReportServiceLabel(Report report) {
        Long serviceId = resolveReportServiceId(report);
        if (serviceId == null) {
            return null;
        }
        return services.findById(serviceId).map(Service::getTitle).orElse("Обява");
    }

    private String resolveReportBusinessLabel(Report report) {
        Long serviceId = resolveReportServiceId(report);
        if (serviceId == null) {
            return null;
        }
        Service service = services.findById(serviceId).orElse(null);
        if (service == null) {
            return null;
        }
        return businessProfiles.findById(service.getBusinessUserId())
                .map(BusinessProfile::getBusinessName)
                .filter((name) -> !safe(name).isBlank())
                .orElseGet(() -> users.findById(service.getBusinessUserId()).map(User::getUsername).orElse("Бизнес профил"));
    }

    private String resolveReportServiceCoverImageUrl(Report report) {
        Long serviceId = resolveReportServiceId(report);
        if (serviceId == null) {
            return null;
        }
        return resolveServiceCoverImageUrl(serviceId);
    }

    private Long resolveReportBusinessUserId(Report report) {
        Long serviceId = resolveReportServiceId(report);
        if (serviceId == null) {
            return null;
        }
        return services.findById(serviceId).map(Service::getBusinessUserId).orElse(null);
    }

    private Long resolveReportServiceId(Report report) {
        return switch (report.getTargetType()) {
            case SERVICE -> report.getTargetId();
            case REVIEW -> reviews.findById(report.getTargetId()).map(Review::getServiceId).orElse(null);
            case COMMENT -> comments.findById(report.getTargetId()).map(this::resolveCommentServiceId).orElse(null);
            case USER -> null;
        };
    }

    private Long resolveCommentServiceId(Comment comment) {
        if (comment.getParentReviewId() != null) {
            Long reviewServiceId = reviews.findById(comment.getParentReviewId())
                    .map(Review::getServiceId)
                    .orElse(null);
            if (reviewServiceId != null) {
                return reviewServiceId;
            }
        }
        return comment.getServiceId();
    }

    private String resolveReportTargetUserRole(Report report) {
        if (report.getTargetType() != Report.TargetType.USER) {
            return null;
        }
        return users.findById(report.getTargetId()).map((user) -> user.getRole().name()).orElse(null);
    }

    private List<AdminReportListingOTD> resolveReportTargetUserListings(Report report) {
        if (report.getTargetType() != Report.TargetType.USER) {
            return List.of();
        }
        User targetUser = users.findById(report.getTargetId()).orElse(null);
        if (targetUser == null || targetUser.getRole() != User.Role.BUSINESS) {
            return List.of();
        }
        String businessLabel = businessProfiles.findById(targetUser.getId())
                .map(BusinessProfile::getBusinessName)
                .filter((name) -> !safe(name).isBlank())
                .orElse(targetUser.getUsername());
        return services.findAllByBusinessUserIdOrderByIdDesc(targetUser.getId())
                .stream()
                .limit(4)
                .map((service) -> new AdminReportListingOTD(
                        service.getId(),
                        service.getTitle(),
                        resolveServiceCoverImageUrl(service.getId()),
                        businessLabel
                ))
                .toList();
    }

    private String resolveServiceCoverImageUrl(Long serviceId) {
        List<ServiceImage> images = serviceImages.findByServiceIdOrderBySortOrderAsc(serviceId);
        return images.stream()
                .filter(ServiceImage::isCover)
                .map(ServiceImage::getImageUrl)
                .findFirst()
                .orElse(images.stream().findFirst().map(ServiceImage::getImageUrl).orElse(null));
    }

    private String resolveUserDisplayName(Long userId) {
        ClientProfile clientProfile = clientProfiles.findById(userId).orElse(null);
        if (clientProfile != null) {
            String fullName = (safe(clientProfile.getFirstName()) + " " + safe(clientProfile.getLastName())).trim();
            if (!fullName.isBlank()) {
                return fullName;
            }
        }
        BusinessProfile businessProfile = businessProfiles.findById(userId).orElse(null);
        if (businessProfile != null && !safe(businessProfile.getBusinessName()).isBlank()) {
            return businessProfile.getBusinessName();
        }
        return users.findById(userId).map(User::getUsername).orElse("Потребител");
    }

    private AdminUserProfileOTD toClientUserDto(User user) {
        ClientProfile profile = clientProfiles.findById(user.getId()).orElse(null);
        String displayName = profile == null
                ? user.getUsername()
                : (safe(profile.getFirstName()) + " " + safe(profile.getLastName())).trim();
        if (displayName.isBlank()) {
            displayName = user.getUsername();
        }
        return new AdminUserProfileOTD(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                displayName,
                null,
                null,
                profile != null ? profile.getPhone() : null,
                profile != null ? profile.getPhotoUrl() : null,
                profile != null ? profile.getBio() : null,
                0
        );
    }

    private AdminUserProfileOTD toBusinessUserDto(User user) {
        BusinessProfile profile = businessProfiles.findById(user.getId()).orElse(null);
        int listingCount = services.findAllByBusinessUserIdOrderByIdDesc(user.getId()).size();
        return new AdminUserProfileOTD(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                profile != null ? profile.getBusinessName() : user.getUsername(),
                profile != null ? profile.getCity() : null,
                profile != null ? profile.getAddress() : null,
                profile != null ? profile.getPhone() : null,
                profile != null ? profile.getPhotoUrl() : null,
                null,
                listingCount
        );
    }

    private void cancelFutureBookingsForDeletedService(Long serviceId, String reason) {
        List<Booking> futureBookings = bookings.findFutureBookingsByServiceIdAndStatuses(
                serviceId,
                List.of(Booking.Status.PENDING, Booking.Status.CONFIRMED),
                LocalDateTime.now()
        );

        for (Booking booking : futureBookings) {
            booking.setStatus(Booking.Status.CANCELED);
            booking.setStatusReason(reason);
            bookings.save(booking);
        }
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
