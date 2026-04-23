package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.*;
import com.martinzaimov.bookinghub.entity.Booking;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.Favorite;
import com.martinzaimov.bookinghub.entity.FavoriteId;
import com.martinzaimov.bookinghub.entity.RecentSearch;
import com.martinzaimov.bookinghub.entity.Resource;
import com.martinzaimov.bookinghub.entity.ResourceSlot;
import com.martinzaimov.bookinghub.entity.Service;
import com.martinzaimov.bookinghub.entity.ServiceImage;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.*;
import jakarta.transaction.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

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
            ServiceResourceDao serviceResources
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
                profile.getPhone()
        );
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
        clientProfiles.save(profile);

        return new ClientProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getPhone()
        );
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

        List<ResourceSlot> availableSlots = slots.findByServiceIdAndStatusOrderByStartAtAsc(serviceId, ResourceSlot.Status.AVAILABLE);
        if (availableSlots.isEmpty()) {
            ensureSlotsForService(service);
            availableSlots = slots.findByServiceIdAndStatusOrderByStartAtAsc(serviceId, ResourceSlot.Status.AVAILABLE);
        }

        return availableSlots
                .stream()
                .map(slot -> new AvailableSlotDTO(
                        slot.getId(),
                        slot.getResourceId(),
                        slot.getStartAt(),
                        slot.getEndAt()
                ))
                .toList();
    }

    @Transactional
    public BookingItemDTO createBooking(Long userId, CreateBookingRequest request) {
        requireClientUser(userId);

        Service service = services.findByIdAndActiveTrue(request.serviceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        ResourceSlot slot = slots.findByIdAndServiceId(request.slotId, request.serviceId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Slot not found"));

        if (slot.getStatus() != ResourceSlot.Status.AVAILABLE || bookings.existsBySlotId(slot.getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "This slot is no longer available");
        }

        slot.setStatus(ResourceSlot.Status.BOOKED);
        slots.save(slot);

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

    private void ensureSlotsForService(Service service) {
        List<Long> linkedResourceIds = serviceResources.findResourceIdsByServiceId(service.getId());

        Long resourceId = linkedResourceIds.stream().findFirst().orElseGet(() -> {
            Resource resource = resources.findAllByBusinessUserIdOrderByNameAsc(service.getBusinessUserId())
                    .stream()
                    .findFirst()
                    .orElseGet(() -> createFallbackResource(service));

            if (!linkedResourceIds.contains(resource.getId())) {
                serviceResources.link(service.getId(), resource.getId());
            }

            return resource.getId();
        });

        LocalDate date = LocalDate.now().plusDays(1);
        int slotMinutes = service.getDurationMinutes() == null || service.getDurationMinutes() <= 0
                ? 30
                : service.getDurationMinutes();

        LocalDateTime start = date.atTime(9, 0);
        LocalDateTime end = date.atTime(18, 0);
        generateSlots(resourceId, service.getId(), start, end, slotMinutes);
    }

    private Resource createFallbackResource(Service service) {
        Resource resource = new Resource();
        resource.setBusinessUserId(service.getBusinessUserId());
        resource.setType(Resource.Type.STAFF);
        resource.setName(service.getTitle() + " Resource");
        resource.setActive(true);
        return resources.save(resource);
    }

    private void generateSlots(Long resourceId, Long serviceId, LocalDateTime start, LocalDateTime end, int slotMinutes) {
        List<ResourceSlot> existing = slots.findByServiceIdAndResourceIdAndStartAtBetween(serviceId, resourceId, start, end);
        if (!existing.isEmpty()) {
            return;
        }

        LocalDateTime current = start;
        while (!current.plusMinutes(slotMinutes).isAfter(end)) {
            ResourceSlot slot = new ResourceSlot();
            slot.setResourceId(resourceId);
            slot.setServiceId(serviceId);
            slot.setStartAt(current);
            slot.setEndAt(current.plusMinutes(slotMinutes));
            slot.setStatus(ResourceSlot.Status.AVAILABLE);
            slot.setHoldExpiresAt(null);
            slots.save(slot);
            current = current.plusMinutes(slotMinutes);
        }
    }
}
