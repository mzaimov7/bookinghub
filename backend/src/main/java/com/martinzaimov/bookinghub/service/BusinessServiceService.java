package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.BusinessBookingDTO;
import com.martinzaimov.bookinghub.dto.CreateServiceRequest;
import com.martinzaimov.bookinghub.dto.ServiceOTD;
import com.martinzaimov.bookinghub.dto.BusinessServiceStatsDTO;
import com.martinzaimov.bookinghub.dto.UpdateServiceRequest;
import com.martinzaimov.bookinghub.dto.UpdateBusinessBookingRequest;
import com.martinzaimov.bookinghub.entity.Booking;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.Resource;
import com.martinzaimov.bookinghub.entity.ResourceSlot;
import com.martinzaimov.bookinghub.entity.Service;
import com.martinzaimov.bookinghub.entity.ServiceImage;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@org.springframework.stereotype.Service
public class BusinessServiceService {

    private final ServiceRepository services;
    private final CategoryRepository categories;
    private final UserRepository users;
    private final ResourceRepository resources;
    private final ServiceResourceDao serviceResourceDao;
    private final ServiceImageRepository serviceImages;
    private final BookingRepository bookings;
    private final ClientProfileRepository clientProfiles;
    private final ResourceSlotRepository slots;
    private final ReviewRepository reviews;
    private final CommentRepository comments;
    private final EmailService emailService;
    private final BookingStatusSyncService bookingStatusSync;
    private final Path uploadDir;

    public BusinessServiceService(
            ServiceRepository services,
            CategoryRepository categories,
            UserRepository users,
            ResourceRepository resources,
            ServiceResourceDao serviceResourceDao,
            ServiceImageRepository serviceImages,
            BookingRepository bookings,
            ClientProfileRepository clientProfiles,
            ResourceSlotRepository slots,
            ReviewRepository reviews,
            CommentRepository comments,
            EmailService emailService,
            BookingStatusSyncService bookingStatusSync,
            @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.services = services;
        this.categories = categories;
        this.users = users;
        this.resources = resources;
        this.serviceResourceDao = serviceResourceDao;
        this.serviceImages = serviceImages;
        this.bookings = bookings;
        this.clientProfiles = clientProfiles;
        this.slots = slots;
        this.reviews = reviews;
        this.comments = comments;
        this.emailService = emailService;
        this.bookingStatusSync = bookingStatusSync;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public Long createService(Long businessUserId, CreateServiceRequest req) {
        requireBusinessUser(businessUserId);

        var cat = categories.findById(req.categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Service s = new Service();
        s.setBusinessUserId(businessUserId);
        s.setCategory(cat);
        s.setCategorySuggestion(normalize(req.categorySuggestion));
        s.setTitle(req.title.trim());
        s.setDescription(req.description);
        s.setCity(req.city.trim());
        s.setAddress(req.address.trim());
        s.setPrice(req.price == null ? BigDecimal.ZERO : req.price);
        s.setDurationMinutes(req.durationMinutes);
        s.setOpensAt(parseTime(req.opensAt, "opensAt"));
        s.setClosesAt(parseTime(req.closesAt, "closesAt"));
        s.setSlotIntervalMinutes(normalizePositive(req.slotIntervalMinutes, 30));
        s.setBookingHorizonDays(normalizePositive(req.bookingHorizonDays, 90));
        s.setActive(false);
        s.setApprovalStatus(Service.ApprovalStatus.PENDING);
        s.setApprovalNote("Очаква админ одобрение преди публикуване.");

        s = services.save(s);

        if (req.resourceIds == null || req.resourceIds.isEmpty()) {
            throw new IllegalArgumentException("resourceIds is required");
        }

        for (Long rid : req.resourceIds) {
            if (rid == null) continue;

            var rOpt = resources.findByIdAndBusinessUserId(rid, businessUserId);
            if (rOpt.isEmpty()) {
                throw new IllegalArgumentException("Invalid resourceId (not owned by this business): " + rid);
            }

            serviceResourceDao.link(s.getId(), rid);
        }

        saveServiceImages(s.getId(), req.imageUrls, req.coverIndex);

        return s.getId();
    }

    @Transactional
    public String uploadListingImage(Long businessUserId, MultipartFile file) {
        requireBusinessUser(businessUserId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose an image file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        String extension = extensionOf(file.getOriginalFilename());
        String filename = "service_" + UUID.randomUUID() + extension;

        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to upload image");
        }
    }

    public List<ServiceOTD> getMyServices(Long businessUserId) {
        requireBusinessUser(businessUserId);
        return services.findAllByBusinessUserIdOrderByIdDesc(businessUserId)
                .stream()
                .map(this::toServiceDto)
                .toList();
    }

    public List<BusinessServiceStatsDTO> getMyServiceStats(Long businessUserId) {
        requireBusinessUser(businessUserId);
        List<Service> ownedServices = services.findAllByBusinessUserIdOrderByIdDesc(businessUserId);
        if (ownedServices.isEmpty()) {
            return List.of();
        }

        List<Long> serviceIds = ownedServices.stream().map(Service::getId).toList();
        var visibleReviews = reviews.findAllByServiceIdInAndStatus(serviceIds, com.martinzaimov.bookinghub.entity.Review.Status.VISIBLE);
        var visibleComments = comments.findAllByServiceIdInAndStatus(serviceIds, com.martinzaimov.bookinghub.entity.Comment.Status.VISIBLE);

        return ownedServices.stream()
                .map(service -> {
                    List<com.martinzaimov.bookinghub.entity.Review> serviceReviews = visibleReviews.stream()
                            .filter(review -> review.getServiceId().equals(service.getId()))
                            .toList();
                    double averageRating = serviceReviews.stream()
                            .mapToInt(review -> review.getRating() == null ? 0 : review.getRating())
                            .average()
                            .orElse(0);
                    long commentCount = visibleComments.stream()
                            .filter(comment -> comment.getServiceId().equals(service.getId()))
                            .count();
                    return new BusinessServiceStatsDTO(
                            service.getId(),
                            service.getTitle(),
                            averageRating,
                            bookings.countByServiceId(service.getId()),
                            commentCount,
                            (long) serviceReviews.size()
                    );
                })
                .toList();
    }

    public ServiceOTD getMyService(Long businessUserId, Long serviceId) {
        requireBusinessUser(businessUserId);
        Service service = services.findById(serviceId)
                .filter(item -> item.getBusinessUserId().equals(businessUserId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));
        return toServiceDto(service);
    }

    @Transactional
    public Long updateService(Long businessUserId, Long serviceId, UpdateServiceRequest req) {
        requireBusinessUser(businessUserId);

        Service service = services.findById(serviceId)
                .filter(item -> item.getBusinessUserId().equals(businessUserId))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        var cat = categories.findById(req.categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        List<Long> nextResourceIds = normalizeResourceIds(req.resourceIds, businessUserId);
        if (nextResourceIds.isEmpty()) {
            throw new IllegalArgumentException("Choose at least one staff member or team");
        }

        service.setCategory(cat);
        service.setCategorySuggestion(normalize(req.categorySuggestion));
        service.setTitle(req.title.trim());
        service.setDescription(req.description);
        service.setCity(req.city.trim());
        service.setAddress(req.address.trim());
        service.setPrice(req.price == null ? BigDecimal.ZERO : req.price);
        service.setDurationMinutes(req.durationMinutes);
        service.setOpensAt(parseTime(req.opensAt, "opensAt"));
        service.setClosesAt(parseTime(req.closesAt, "closesAt"));
        service.setSlotIntervalMinutes(normalizePositive(req.slotIntervalMinutes, 30));
        service.setBookingHorizonDays(normalizePositive(req.bookingHorizonDays, 90));
        if (service.getApprovalStatus() == Service.ApprovalStatus.REJECTED) {
            service.setApprovalStatus(Service.ApprovalStatus.PENDING);
            service.setApprovalNote("Редактирана е и очаква ново админ одобрение.");
            service.setApprovalReviewedByUserId(null);
            service.setApprovalReviewedAt(null);
        }
        services.save(service);

        List<Long> currentResourceIds = serviceResourceDao.findResourceIdsByServiceId(serviceId);
        List<Long> removedResourceIds = currentResourceIds.stream()
                .filter(resourceId -> !nextResourceIds.contains(resourceId))
                .toList();

        if (!removedResourceIds.isEmpty()) {
            for (Long resourceId : removedResourceIds) {
                slots.deleteByServiceIdAndResourceIdAndStatus(serviceId, resourceId, ResourceSlot.Status.AVAILABLE);
            }
        }

        serviceResourceDao.unlinkAll(serviceId);
        for (Long resourceId : nextResourceIds) {
            serviceResourceDao.link(serviceId, resourceId);
        }

        if (req.imageUrls != null) {
            replaceServiceImages(serviceId, req.imageUrls, req.coverIndex);
        }

        return serviceId;
    }

    public List<BusinessBookingDTO> getBookings(Long businessUserId) {
        requireBusinessUser(businessUserId);
        bookingStatusSync.syncBookingStatuses();

        List<Service> ownedServices = services.findAllByBusinessUserIdOrderByIdDesc(businessUserId);
        if (ownedServices.isEmpty()) {
            return List.of();
        }

        Map<Long, Service> servicesById = new LinkedHashMap<>();
        for (Service service : ownedServices) {
            servicesById.put(service.getId(), service);
        }

        List<Booking> ownedBookings = bookings.findByServiceIdsOrderByCreatedAtDesc(ownedServices.stream().map(Service::getId).toList());
        if (ownedBookings.isEmpty()) {
            return List.of();
        }

        Map<Long, ResourceSlot> slotsById = new LinkedHashMap<>();
        Map<Long, Resource> resourcesById = new LinkedHashMap<>();
        Map<Long, User> usersById = new LinkedHashMap<>();
        Map<Long, ClientProfile> profilesByUserId = new LinkedHashMap<>();

        for (Booking booking : ownedBookings) {
            ResourceSlot slot = slots.findById(booking.getSlotId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Slot not found"));
            slotsById.put(slot.getId(), slot);

            resources.findById(slot.getResourceId()).ifPresent(resource -> resourcesById.put(resource.getId(), resource));
            users.findById(booking.getClientUserId()).ifPresent(user -> usersById.put(user.getId(), user));
            clientProfiles.findById(booking.getClientUserId()).ifPresent(profile -> profilesByUserId.put(profile.getUserId(), profile));
        }

        return ownedBookings.stream()
                .map(booking -> toBusinessBookingDto(
                        booking,
                        servicesById.get(booking.getServiceId()),
                        slotsById.get(booking.getSlotId()),
                        resourcesById.get(slotsById.get(booking.getSlotId()).getResourceId()),
                        usersById.get(booking.getClientUserId()),
                        profilesByUserId.get(booking.getClientUserId())
                ))
                .toList();
    }

    @Transactional
    public BusinessBookingDTO updateBookingStatus(Long businessUserId, Long bookingId, UpdateBusinessBookingRequest request) {
        requireBusinessUser(businessUserId);

        List<Long> ownedServiceIds = services.findAllByBusinessUserIdOrderByIdDesc(businessUserId)
                .stream()
                .map(Service::getId)
                .toList();

        if (ownedServiceIds.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "No services found for this business account");
        }

        Booking booking = bookings.findOwnedBookingById(bookingId, ownedServiceIds)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Booking not found"));

        Booking.Status nextStatus;
        try {
            nextStatus = Booking.Status.valueOf(request.status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Status must be CONFIRMED, COMPLETED or REJECTED");
        }

        if (nextStatus != Booking.Status.CONFIRMED
                && nextStatus != Booking.Status.COMPLETED
                && nextStatus != Booking.Status.REJECTED) {
            throw new ResponseStatusException(BAD_REQUEST, "Status must be CONFIRMED, COMPLETED or REJECTED");
        }

        String reason = normalize(request.reason);
        ResourceSlot slot = slots.findById(booking.getSlotId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Slot not found"));

        if (nextStatus == Booking.Status.REJECTED) {
            if (booking.getStatus() != Booking.Status.PENDING) {
                throw new ResponseStatusException(BAD_REQUEST, "Only pending bookings can be rejected");
            }
            if (reason == null) {
                throw new ResponseStatusException(BAD_REQUEST, "Rejection reason is required");
            }
            booking.setStatus(Booking.Status.REJECTED);
            booking.setStatusReason(reason);
            slot.setStatus(ResourceSlot.Status.AVAILABLE);
        } else if (nextStatus == Booking.Status.CONFIRMED) {
            if (booking.getStatus() != Booking.Status.PENDING) {
                throw new ResponseStatusException(BAD_REQUEST, "Only pending bookings can be approved");
            }
            booking.setStatus(Booking.Status.CONFIRMED);
            booking.setStatusReason(null);
            slot.setStatus(ResourceSlot.Status.BOOKED);
        } else {
            if (booking.getStatus() != Booking.Status.CONFIRMED) {
                throw new ResponseStatusException(BAD_REQUEST, "Only confirmed bookings can be marked as completed");
            }
            booking.setStatus(Booking.Status.COMPLETED);
            booking.setStatusReason(null);
            slot.setStatus(ResourceSlot.Status.BOOKED);
        }

        slots.save(slot);
        Booking saved = bookings.save(booking);

        Service service = services.findById(saved.getServiceId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));
        notifyClientForBusinessBookingUpdate(saved, service, slot, nextStatus, reason);
        Resource resource = resources.findById(slot.getResourceId()).orElse(null);
        User client = users.findById(saved.getClientUserId()).orElse(null);
        ClientProfile profile = clientProfiles.findById(saved.getClientUserId()).orElse(null);

        return toBusinessBookingDto(saved, service, slot, resource, client, profile);
    }

    private User requireBusinessUser(Long businessUserId) {
        User user = users.findById(businessUserId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Business user not found"));
        if (user.getRole() != User.Role.BUSINESS) {
            throw new ResponseStatusException(BAD_REQUEST, "Only BUSINESS accounts can use this endpoint");
        }
        if (!user.isActive()) {
            throw new ResponseStatusException(BAD_REQUEST, "This business account is disabled");
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
        List<String> imageUrls = images.stream().map(ServiceImage::getImageUrl).toList();
        List<Long> resourceIds = serviceResourceDao.findResourceIdsByServiceId(service.getId());

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
                formatTime(service.getOpensAt()),
                formatTime(service.getClosesAt()),
                service.getSlotIntervalMinutes(),
                service.getBookingHorizonDays(),
                coverUrl,
                imageUrls,
                resourceIds
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

    private void saveServiceImages(Long serviceId, List<String> imageUrls, Integer coverIndex) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        int normalizedCoverIndex = coverIndex == null ? 0 : Math.max(0, coverIndex);
        int savedCount = 0;

        for (int i = 0; i < imageUrls.size() && savedCount < 3; i++) {
            String url = normalize(imageUrls.get(i));
            if (url == null) {
                continue;
            }

            ServiceImage image = new ServiceImage();
            image.setServiceId(serviceId);
            image.setImageUrl(url);
            image.setSortOrder(savedCount);
            image.setCover(savedCount == normalizedCoverIndex);
            serviceImages.save(image);
            savedCount++;
        }

        if (savedCount > 0 && normalizedCoverIndex >= savedCount) {
            serviceImages.findByServiceIdOrderBySortOrderAsc(serviceId).stream().findFirst().ifPresent(first -> {
                first.setCover(true);
                serviceImages.save(first);
            });
        }
    }

    private void replaceServiceImages(Long serviceId, List<String> imageUrls, Integer coverIndex) {
        serviceImages.deleteByServiceId(serviceId);
        saveServiceImages(serviceId, imageUrls, coverIndex);
    }

    private List<Long> normalizeResourceIds(List<Long> resourceIds, Long businessUserId) {
        if (resourceIds == null || resourceIds.isEmpty()) {
            return List.of();
        }

        LinkedHashSet<Long> normalizedIds = new LinkedHashSet<>();
        for (Long resourceId : resourceIds) {
            if (resourceId == null) continue;
            resources.findByIdAndBusinessUserId(resourceId, businessUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid resourceId (not owned by this business): " + resourceId));
            normalizedIds.add(resourceId);
        }
        return List.copyOf(normalizedIds);
    }

    private BusinessBookingDTO toBusinessBookingDto(
            Booking booking,
            Service service,
            ResourceSlot slot,
            Resource resource,
            User client,
            ClientProfile profile
    ) {
        String coverUrl = serviceImages.findFirstByServiceIdAndCoverTrueOrderBySortOrderAsc(service.getId())
                .map(ServiceImage::getImageUrl)
                .orElse(null);

        String clientName = profile == null
                ? (client != null ? client.getUsername() : "Client")
                : (profile.getFirstName() + " " + profile.getLastName()).trim();

        return new BusinessBookingDTO(
                booking.getId(),
                booking.getServiceId(),
                booking.getSlotId(),
                booking.getClientUserId(),
                clientName,
                client != null ? client.getEmail() : "",
                service.getTitle(),
                resource != null ? resource.getName() : "Assigned resource",
                resource != null ? resource.getType().name() : "STAFF",
                booking.getStatus().name(),
                booking.getStatusReason(),
                booking.getClientNote(),
                booking.getCreatedAt(),
                slot.getStartAt(),
                slot.getEndAt(),
                service.getPrice(),
                service.getDurationMinutes(),
                coverUrl
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

    private void notifyClientForBusinessBookingUpdate(
            Booking booking,
            Service service,
            ResourceSlot slot,
            Booking.Status nextStatus,
            String reason
    ) {
        users.findById(booking.getClientUserId()).ifPresent(client -> {
            if (nextStatus == Booking.Status.CONFIRMED) {
                emailService.send(
                        client.getEmail(),
                        "Резервацията ти е потвърдена",
                        "Резервацията ти за \"" + service.getTitle() + "\" беше потвърдена.\n\n" +
                                "Дата и час: " + slot.getStartAt()
                );
            } else if (nextStatus == Booking.Status.REJECTED) {
                emailService.send(
                        client.getEmail(),
                        "Резервацията ти е отказана",
                        "Резервацията ти за \"" + service.getTitle() + "\" беше отказана.\n\n" +
                                "Дата и час: " + slot.getStartAt() + "\n" +
                                "Причина: " + reason
                );
            }
        });
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private LocalTime parseTime(String value, String fieldName) {
        String normalized = normalize(value);
        if (normalized == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }

        try {
            return LocalTime.parse(normalized);
        } catch (Exception ex) {
            throw new IllegalArgumentException(fieldName + " must be in HH:mm format");
        }
    }

    private int normalizePositive(int value, int fallback) {
        return value > 0 ? value : fallback;
    }

    private String formatTime(LocalTime value) {
        return value == null ? null : value.toString();
    }

    private String extensionOf(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf(".");
        if (dot < 0 || dot == filename.length() - 1) return ".jpg";
        String ext = filename.substring(dot).toLowerCase();
        return ext.length() > 10 ? ".jpg" : ext;
    }
}
