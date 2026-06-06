package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByClientUserIdOrderByCreatedAtDesc(Long clientUserId);
    long countByServiceId(Long serviceId);
    boolean existsBySlotIdAndStatusIn(Long slotId, List<Booking.Status> statuses);

    @Query("""
        select b
        from Booking b
        join ResourceSlot rs on rs.id = b.slotId
        where b.status = com.martinzaimov.bookinghub.entity.Booking.Status.CONFIRMED
          and rs.startAt < :now
    """)
    List<Booking> findPastConfirmedBookings(@Param("now") LocalDateTime now);

    @Query("""
        select b
        from Booking b
        join Service s on s.id = b.serviceId
        join User u on u.id = s.businessUserId
        where b.status in (
            com.martinzaimov.bookinghub.entity.Booking.Status.PENDING,
            com.martinzaimov.bookinghub.entity.Booking.Status.CONFIRMED
        )
          and (s.active = false or u.active = false)
    """)
    List<Booking> findActiveBookingsForInactiveServicesOrBusinesses();

    @Query("""
        select b
        from Booking b
        where b.serviceId in :serviceIds
        order by b.createdAt desc
    """)
    List<Booking> findByServiceIdsOrderByCreatedAtDesc(@Param("serviceIds") List<Long> serviceIds);

    @Query("""
        select b
        from Booking b
        where b.id = :bookingId
          and b.serviceId in :serviceIds
    """)
    Optional<Booking> findOwnedBookingById(@Param("bookingId") Long bookingId, @Param("serviceIds") List<Long> serviceIds);

    @Query("""
        select b
        from Booking b
        join ResourceSlot rs on rs.id = b.slotId
        where b.serviceId = :serviceId
          and b.status in :statuses
          and rs.startAt >= :fromDateTime
        order by rs.startAt asc
    """)
    List<Booking> findFutureBookingsByServiceIdAndStatuses(
            @Param("serviceId") Long serviceId,
            @Param("statuses") List<Booking.Status> statuses,
            @Param("fromDateTime") LocalDateTime fromDateTime
    );
}
