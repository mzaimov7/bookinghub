package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsBySlotId(Long slotId);
    List<Booking> findByClientUserIdOrderByCreatedAtDesc(Long clientUserId);
}
