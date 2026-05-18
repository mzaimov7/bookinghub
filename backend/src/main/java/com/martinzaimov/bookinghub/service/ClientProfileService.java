package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.*;
import com.martinzaimov.bookinghub.entity.Booking;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.Favorite;
import com.martinzaimov.bookinghub.entity.FavoriteId;
import com.martinzaimov.bookinghub.entity.RecentSearch;
import com.martinzaimov.bookinghub.entity.Resource;
import com.martinzaimov.bookinghub.entity.ResourceDayOff;
import com.martinzaimov.bookinghub.entity.ResourceSlot;
import com.martinzaimov.bookinghub.entity.ResourceWeeklyOffDay;
import com.martinzaimov.bookinghub.entity.Service;
import com.martinzaimov.bookinghub.entity.ServiceImage;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@org.springframework.stereotype.Service
public class ClientProfileService {

    private final UserRepository users;
    private final ClientProfileRepository clientProfiles;
    private final ServiceRepository services;
    private final ServiceImageRepository serviceImages;
    private final FavoriteRepository favorites;
    private final RecentSearchRepository recentSearches;
    private final BookingRepository bookings;
    private final ResourceSlotRepository slots;
    private final ResourceRepository resources;
    private final ServiceResourceDao serviceResources;
    private final ResourceWeeklyOffDayRepository resourceWeeklyOffDays;
    private final ResourceDayOffRepository resourceDayOffs;
    private final PasswordEncoder passwordEncoder;
    private final Path uploadDir;

    public ClientProfileService(
            UserRepository users,
            ClientProfileRepository clientProfiles,
            ServiceRepository services,
            ServiceImageRepository serviceImages,
            FavoriteRepository favorites,
            RecentSearchRepository recentSearches,
            BookingRepository bookings,
            ResourceSlotRepository slots,
            ResourceRepository resources,
            ServiceResourceDao serviceResources,
            ResourceWeeklyOffDayRepository resourceWeeklyOffDays,
            ResourceDayOffRepository resourceDayOffs,
            PasswordEncoder passwordEncoder,
            @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.users = users;
        this.clientProfiles = clientProfiles;
        this.services = services;
        this.serviceImages = serviceImages;
        this.favorites = favorites;
        this.recentSearches = recentSearches;
        this.bookings = bookings;
        this.slots = slots;
        this.resources = resources;
        this.serviceResources = serviceResources;
        this.resourceWeeklyOffDays = resourceWeeklyOffDays;
        this.resourceDayOffs = resourceDayOffs;
        this.passwordEncoder = passwordEncoder;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public List<ServiceOTD> getFavorites(Long userId) {
        requireClientUser(userId);

        List<Long> serviceIds = favorites.findByIdUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(favorite -> favorite.getId().getServiceId())
                .distinct()
                .toList();

        if (serviceIds.isEmpty()) return List.of();

        List<ServiceOTD> items = new ArrayList<>();
        for (Long serviceId : serviceIds) {
            services.findByIdAndActiveTrue(serviceId).ifPresent(service -> items.add(toServiceDto(service)));
        }
        return items;
    }

    public ClientProfileDTO getProfile(Long userId) {
        User user = requireClientUser(userId);
        ClientProfile profile = clientProfiles.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Client profile not found"));

        return new ClientProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getPhone(),
                profile.getPhotoUrl(),
                profile.getBio()
        );
    }

    public void verifyProfilePassword(Long userId, String password) {
        User user = requireClientUser(userId);
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Текущата парола е задължителна");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(BAD_REQUEST, "Невалидна парола");
        }
    }

    @Transactional
    public ClientProfileDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = requireClientUser(userId);
        ClientProfile profile = clientProfiles.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Client profile not found"));

        String username = normalize(request.username);
        String email = normalize(request.email);
        String firstName = normalize(request.firstName);
        String lastName = normalize(request.lastName);

        if (username == null || email == null || firstName == null || lastName == null) {
            throw new IllegalArgumentException("Username, email, first name and last name are required");
        }

        users.findByUsernameIgnoreCase(username)
                .filter(found -> !Objects.equals(found.getId(), userId))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Username already taken");
                });

        users.findByEmailIgnoreCase(email)
                .filter(found -> !Objects.equals(found.getId(), userId))
                .ifPresent(found -> {
                    throw new IllegalArgumentException("Email already used");
                });

        user.setUsername(username);
        user.setEmail(email.toLowerCase());
        users.save(user);

        profile.setFirstName(firstName);
        profile.setLastName(lastName);
        profile.setPhone(normalize(request.phone));
        profile.setBio(normalize(request.bio));
        clientProfiles.save(profile);

        return new ClientProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getPhone(),
                profile.getPhotoUrl(),
                profile.getBio()
        );
    }

    @Transactional
    public ClientProfileDTO uploadProfilePhoto(Long userId, MultipartFile file) {
        User user = requireClientUser(userId);
        ClientProfile profile = clientProfiles.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Client profile not found"));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Моля избери снимка");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(BAD_REQUEST, "Разрешени са само снимки");
        }

        String filename = "client_" + userId + "_" + UUID.randomUUID() + extensionOf(file.getOriginalFilename());
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            profile.setPhotoUrl("/uploads/" + filename);
            clientProfiles.save(profile);
        } catch (IOException ex) {
            throw new IllegalStateException("Неуспешно качване на снимката");
        }

        return new ClientProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getPhone(),
                profile.getPhotoUrl(),
                profile.getBio()
        );
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = requireClientUser(userId);
        if (request.currentPassword == null || request.currentPassword.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Текущата парола е задължителна");
        }
        if (!passwordEncoder.matches(request.currentPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(BAD_REQUEST, "Текущата парола е грешна");
        }
        if (request.newPassword == null || request.newPassword.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Новата парола е задължителна");
        }
        if (!request.newPassword.equals(request.confirmPassword)) {
            throw new ResponseStatusException(BAD_REQUEST, "Новата парола и потвърждението не съвпадат");
        }
        if (passwordEncoder.matches(request.newPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(BAD_REQUEST, "Новата парола трябва да е различна от текущата");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword));
        users.save(user);
    }

    public List<Long> getFavoriteIds(Long userId) {
        requireClientUser(userId);
        return favorites.findByIdUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(favorite -> favorite.getId().getServiceId())
                .distinct()
                .toList();
    }

    @Transactional
    public void addFavorite(Long userId, Long serviceId) {
        requireClientUser(userId);
        services.findByIdAndActiveTrue(serviceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        if (favorites.existsByIdUserIdAndIdServiceId(userId, serviceId)) {
            return;
        }

        Favorite favorite = new Favorite();
        favorite.setId(new FavoriteId(userId, serviceId));
        favorites.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long userId, Long serviceId) {
        requireClientUser(userId);
        favorites.deleteByIdUserIdAndIdServiceId(userId, serviceId);
    }

    public List<RecentSearchDTO> getRecentSearches(Long userId) {
        requireClientUser(userId);
        return recentSearches.findTop10ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(item -> new RecentSearchDTO(
                        item.getId(),
                        item.getQueryText(),
                        item.getCity(),
                        item.getCategoryId(),
                        item.getMinPrice(),
                        item.getMaxPrice(),
                        item.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public void saveRecentSearch(Long userId, RecentSearchRequest request) {
        requireClientUser(userId);

        String query = normalize(request.query);
        String city = normalize(request.city);
        Long categoryId = request.categoryId;
        BigDecimal minPrice = request.minPrice;
        BigDecimal maxPrice = request.maxPrice;

        if (query == null && city == null && categoryId == null && minPrice == null && maxPrice == null) {
            return;
        }

        RecentSearch item = new RecentSearch();
        item.setUserId(userId);
        item.setQueryText(query);
        item.setCity(city);
        item.setCategoryId(categoryId);
        item.setMinPrice(minPrice);
        item.setMaxPrice(maxPrice);
        recentSearches.save(item);

        List<RecentSearch> all = recentSearches.findByUserIdOrderByCreatedAtDesc(userId);
        if (all.size() > 10) {
            recentSearches.deleteAll(all.subList(10, all.size()));
        }
    }

    public List<AvailableSlotDTO> getAvailableSlots(Long serviceId) {
        Service service = services.findByIdAndActiveTrue(serviceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        List<Long> activeResourceIds = serviceResources.findResourceIdsByServiceId(serviceId);
        if (activeResourceIds.isEmpty()) {
            return List.of();
        }

        LocalDate today = LocalDate.now();
        int horizonDays = normalizePositive(service.getBookingHorizonDays(), 90);
        LocalDate toDate = today.plusDays(horizonDays);

        List<AvailableSlotDTO> items = new ArrayList<>();
        for (Long resourceId : activeResourceIds) {
            Resource resource = resources.findById(resourceId).orElse(null);
            if (resource == null || !resource.isActive()) {
                continue;
            }
            items.addAll(buildAvailableSlotsForResource(service, resource, today, toDate));
        }

        return items.stream()
                .sorted(Comparator.comparing(AvailableSlotDTO::startAt))
                .toList();
    }

    @Transactional
    public BookingItemDTO createBooking(Long userId, CreateBookingRequest request) {
        requireClientUser(userId);

        Service service = services.findByIdAndActiveTrue(request.serviceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        if (request.resourceId == null || request.startAt == null || request.endAt == null) {
            throw new ResponseStatusException(BAD_REQUEST, "resourceId, startAt and endAt are required");
        }

        Resource resource = resources.findById(request.resourceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Resource not found"));

        List<Long> linkedResourceIds = serviceResources.findResourceIdsByServiceId(service.getId());
        if (!linkedResourceIds.contains(resource.getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "This resource is not assigned to the selected service");
        }

        boolean allowedSlot = buildAvailableSlotsForResource(service, resource, request.startAt.toLocalDate(), request.startAt.toLocalDate())
                .stream()
                .anyMatch(slot ->
                        slot.resourceId().equals(request.resourceId)
                                && slot.startAt().equals(request.startAt)
                                && slot.endAt().equals(request.endAt)
                );

        if (!allowedSlot) {
            throw new ResponseStatusException(BAD_REQUEST, "This time is no longer available");
        }

        ResourceSlot slot = slots.findByServiceIdAndResourceIdAndStartAtAndEndAt(
                        service.getId(),
                        resource.getId(),
                        request.startAt,
                        request.endAt
                )
                .orElseGet(() -> {
                    ResourceSlot created = new ResourceSlot();
                    created.setServiceId(service.getId());
                    created.setResourceId(resource.getId());
                    created.setStartAt(request.startAt);
                    created.setEndAt(request.endAt);
                    created.setStatus(ResourceSlot.Status.BOOKED);
                    created.setHoldExpiresAt(null);
                    return created;
                });

        if (slot.getId() != null
                && bookings.existsBySlotIdAndStatusIn(slot.getId(), List.of(Booking.Status.PENDING, Booking.Status.CONFIRMED))) {
            throw new ResponseStatusException(BAD_REQUEST, "This time is no longer available");
        }

        slot.setStatus(ResourceSlot.Status.BOOKED);
        slot = slots.save(slot);

        Booking booking = new Booking();
        booking.setSlotId(slot.getId());
        booking.setServiceId(service.getId());
        booking.setClientUserId(userId);
        booking.setStatus(Booking.Status.PENDING);
        booking.setClientNote(normalize(request.clientNote));
        booking.setSource(Booking.Source.ONLINE);

        Booking saved = bookings.save(booking);
        return toBookingDto(saved, service, slot);
    }

    public List<BookingItemDTO> getBookings(Long userId) {
        requireClientUser(userId);

        return bookings.findByClientUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(booking -> {
                    Service service = services.findById(booking.getServiceId())
                            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));
                    ResourceSlot slot = slots.findById(booking.getSlotId())
                            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Slot not found"));
                    return toBookingDto(booking, service, slot);
                })
                .toList();
    }

    private User requireClientUser(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (user.getRole() != User.Role.CLIENT) {
            throw new ResponseStatusException(BAD_REQUEST, "This endpoint is for client accounts");
        }

        return user;
    }

    private ServiceOTD toServiceDto(Service service) {
        String coverUrl = serviceImages.findFirstByServiceIdAndCoverTrueOrderBySortOrderAsc(service.getId())
                .map(ServiceImage::getImageUrl)
                .orElse(null);

        return new ServiceOTD(
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
                coverUrl
        );
    }

    private BookingItemDTO toBookingDto(Booking booking, Service service, ResourceSlot slot) {
        String coverUrl = serviceImages.findFirstByServiceIdAndCoverTrueOrderBySortOrderAsc(service.getId())
                .map(ServiceImage::getImageUrl)
                .orElse(null);

        return new BookingItemDTO(
                booking.getId(),
                service.getId(),
                slot.getId(),
                booking.getStatus().name(),
                booking.getStatusReason(),
                booking.getClientNote(),
                booking.getCreatedAt(),
                slot.getStartAt(),
                slot.getEndAt(),
                service.getTitle(),
                service.getCity(),
                service.getAddress(),
                service.getPrice(),
                service.getDurationMinutes(),
                coverUrl
        );
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String extensionOf(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf(".");
        if (dot < 0 || dot == filename.length() - 1) return ".jpg";
        String ext = filename.substring(dot).toLowerCase();
        return ext.length() > 10 ? ".jpg" : ext;
    }

    private List<AvailableSlotDTO> buildAvailableSlotsForResource(Service service, Resource resource, LocalDate fromDate, LocalDate toDate) {
        List<AvailableSlotDTO> items = new ArrayList<>();

        int durationMinutes = normalizePositive(service.getDurationMinutes(), 30);
        int stepMinutes = normalizePositive(service.getSlotIntervalMinutes(), durationMinutes);
        LocalTime opensAt = service.getOpensAt() != null ? service.getOpensAt() : LocalTime.of(9, 0);
        LocalTime closesAt = service.getClosesAt() != null ? service.getClosesAt() : LocalTime.of(18, 0);

        Set<Integer> weeklyOffDays = resourceWeeklyOffDays.findByResourceId(resource.getId())
                .stream()
                .map(ResourceWeeklyOffDay::getDayOfWeek)
                .collect(HashSet::new, HashSet::add, HashSet::addAll);

        Set<LocalDate> dayOffDates = resourceDayOffs.findByResourceIdAndOffDateBetween(resource.getId(), fromDate, toDate)
                .stream()
                .map(ResourceDayOff::getOffDate)
                .collect(HashSet::new, HashSet::add, HashSet::addAll);

        for (LocalDate date = fromDate; !date.isAfter(toDate); date = date.plusDays(1)) {
            if (weeklyOffDays.contains(date.getDayOfWeek().getValue()) || dayOffDates.contains(date)) {
                continue;
            }

            LocalDateTime current = date.atTime(opensAt);
            LocalDateTime dayEnd = date.atTime(closesAt);

            while (!current.plusMinutes(durationMinutes).isAfter(dayEnd)) {
                LocalDateTime slotEnd = current.plusMinutes(durationMinutes);
                if (current.isAfter(LocalDateTime.now()) && isSlotAvailable(service.getId(), resource.getId(), current, slotEnd)) {
                    items.add(new AvailableSlotDTO(
                            resource.getId() + "|" + current,
                            resource.getId(),
                            resource.getName(),
                            resource.getType().name(),
                            resource.getPhotoUrl(),
                            current,
                            slotEnd
                    ));
                }
                current = current.plusMinutes(stepMinutes);
            }
        }

        return items;
    }

    private boolean isSlotAvailable(Long serviceId, Long resourceId, LocalDateTime startAt, LocalDateTime endAt) {
        List<ResourceSlot> occupied = slots.findByServiceIdAndResourceIdAndStatusInAndStartAtLessThanAndEndAtGreaterThan(
                serviceId,
                resourceId,
                List.of(ResourceSlot.Status.BOOKED, ResourceSlot.Status.HELD),
                endAt,
                startAt
        );
        return occupied.isEmpty();
    }

    private int normalizePositive(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }

    private String formatTime(LocalTime value) {
        return value == null ? null : value.toString();
    }
}
