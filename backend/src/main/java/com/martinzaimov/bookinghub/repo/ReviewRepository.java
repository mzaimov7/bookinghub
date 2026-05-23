package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByOrderByCreatedAtDesc();
    List<Review> findAllByServiceIdAndStatusOrderByCreatedAtDesc(Long serviceId, Review.Status status);
    List<Review> findAllByServiceIdInAndStatus(List<Long> serviceIds, Review.Status status);
    Optional<Review> findByBookingId(Long bookingId);
}
