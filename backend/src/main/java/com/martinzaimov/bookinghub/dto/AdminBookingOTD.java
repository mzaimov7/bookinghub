package com.martinzaimov.bookinghub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminBookingOTD(
        Long id,
        Long serviceId,
        String serviceTitle,
        Long businessUserId,
        String businessName,
        Long clientUserId,
        String clientName,
        String resourceName,
        String status,
        String statusReason,
        String clientNote,
        LocalDateTime createdAt,
        LocalDateTime startAt,
        LocalDateTime endAt,
        BigDecimal price
) {
}
