package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByOrderByCreatedAtDesc();
}
