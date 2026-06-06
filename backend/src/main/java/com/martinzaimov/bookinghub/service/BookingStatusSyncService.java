package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.entity.Booking;
import com.martinzaimov.bookinghub.entity.ResourceSlot;
import com.martinzaimov.bookinghub.repo.BookingRepository;
import com.martinzaimov.bookinghub.repo.ResourceSlotRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingStatusSyncService {

    private static final String UNAVAILABLE_REASON = "Обявата или бизнес профилът вече не е активен. Проверете дали обявата отново е активна, преди да направите нова резервация.";

    private final BookingRepository bookings;
    private final ResourceSlotRepository slots;

    public BookingStatusSyncService(BookingRepository bookings, ResourceSlotRepository slots) {
        this.bookings = bookings;
        this.slots = slots;
    }

    @Transactional
    public void syncBookingStatuses() {
        completePastConfirmedBookings();
        cancelBookingsForInactiveServicesOrBusinesses();
    }

    private void completePastConfirmedBookings() {
        List<Booking> pastConfirmedBookings = bookings.findPastConfirmedBookings(LocalDateTime.now());
        for (Booking booking : pastConfirmedBookings) {
            booking.setStatus(Booking.Status.COMPLETED);
            booking.setStatusReason(null);
        }
        if (!pastConfirmedBookings.isEmpty()) {
            bookings.saveAll(pastConfirmedBookings);
        }
    }

    private void cancelBookingsForInactiveServicesOrBusinesses() {
        List<Booking> unavailableBookings = bookings.findActiveBookingsForInactiveServicesOrBusinesses();
        for (Booking booking : unavailableBookings) {
            booking.setStatus(Booking.Status.CANCELED);
            booking.setStatusReason(UNAVAILABLE_REASON);
            slots.findById(booking.getSlotId()).ifPresent(slot -> {
                slot.setStatus(ResourceSlot.Status.AVAILABLE);
                slots.save(slot);
            });
        }
        if (!unavailableBookings.isEmpty()) {
            bookings.saveAll(unavailableBookings);
        }
    }
}
