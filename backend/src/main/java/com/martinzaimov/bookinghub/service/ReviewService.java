package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.ReviewOTD;
import com.martinzaimov.bookinghub.dto.UpsertReviewRequest;
import com.martinzaimov.bookinghub.entity.Booking;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.Review;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.BookingRepository;
import com.martinzaimov.bookinghub.repo.ClientProfileRepository;
import com.martinzaimov.bookinghub.repo.ReviewRepository;
import com.martinzaimov.bookinghub.repo.ServiceRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ReviewService {

    private final ReviewRepository reviews;
    private final BookingRepository bookings;
    private final ServiceRepository services;
    private final UserRepository users;
    private final ClientProfileRepository clientProfiles;

    public ReviewService(
            ReviewRepository reviews,
            BookingRepository bookings,
            ServiceRepository services,
            UserRepository users,
            ClientProfileRepository clientProfiles
    ) {
        this.reviews = reviews;
        this.bookings = bookings;
        this.services = services;
        this.users = users;
        this.clientProfiles = clientProfiles;
    }

    public List<ReviewOTD> getVisibleReviewsForService(Long serviceId) {
        services.findByIdAndActiveTrueAndApprovalStatus(serviceId, com.martinzaimov.bookinghub.entity.Service.ApprovalStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));

        return reviews.findAllByServiceIdAndStatusOrderByCreatedAtDesc(serviceId, Review.Status.VISIBLE)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ReviewOTD upsertReviewForBooking(Long userId, Long bookingId, UpsertReviewRequest request) {
        User user = requireClientUser(userId);
        Booking booking = bookings.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Резервацията не е намерена"));

        if (!booking.getClientUserId().equals(userId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Можеш да оценяваш само своите резервации");
        }
        if (booking.getStatus() != Booking.Status.COMPLETED) {
            throw new ResponseStatusException(BAD_REQUEST, "Отзив може да се остави само за завършена резервация");
        }

        services.findByIdAndActiveTrueAndApprovalStatus(booking.getServiceId(), com.martinzaimov.bookinghub.entity.Service.ApprovalStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Услугата не е намерена"));

        Review review = reviews.findByBookingId(bookingId).orElseGet(Review::new);
        review.setBookingId(booking.getId());
        review.setServiceId(booking.getServiceId());
        review.setAuthorUserId(userId);
        review.setRating(request.rating);
        review.setComment(normalize(request.comment));
        review.setStatus(Review.Status.VISIBLE);

        return toDto(reviews.save(review), user);
    }

    public ReviewOTD getOwnReviewForBooking(Long userId, Long bookingId) {
        requireClientUser(userId);
        Booking booking = bookings.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Резервацията не е намерена"));

        if (!booking.getClientUserId().equals(userId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Можеш да виждаш само своите отзиви");
        }

        return reviews.findByBookingId(bookingId).map(this::toDto).orElse(null);
    }

    public ReviewOTD toDto(Review review) {
        User author = users.findById(review.getAuthorUserId()).orElse(null);
        return toDto(review, author);
    }

    private ReviewOTD toDto(Review review, User author) {
        ClientProfile profile = clientProfiles.findById(review.getAuthorUserId()).orElse(null);
        String authorName = author == null ? "Клиент" : author.getUsername();
        if (profile != null) {
            authorName = (profile.getFirstName() + " " + profile.getLastName()).trim();
        }

        return new ReviewOTD(
                review.getId(),
                review.getBookingId(),
                review.getServiceId(),
                review.getAuthorUserId(),
                authorName.isBlank() ? "Клиент" : authorName,
                profile == null ? null : profile.getPhotoUrl(),
                review.getRating(),
                review.getComment(),
                review.getStatus().name(),
                review.getCreatedAt() == null ? null : review.getCreatedAt().toString()
        );
    }

    private User requireClientUser(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Потребителят не е намерен"));
        if (user.getRole() != User.Role.CLIENT) {
            throw new ResponseStatusException(BAD_REQUEST, "Само клиентски профили могат да оставят отзиви");
        }
        return user;
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
