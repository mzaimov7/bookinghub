package com.martinzaimov.bookinghub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BusinessBookingDTO(
        Long id,
        Long serviceId,
        Long slotId,
        Long clientUserId,
        String clientName,
        String clientEmail,
        String serviceTitle,
        String resourceName,
        String resourceType,
        String status,
        String statusReason,
        String clientNote,
        LocalDateTime createdAt,
        LocalDateTime startAt,
        LocalDateTime endAt,
        BigDecimal price,
        Integer durationMinutes,
        String coverImageUrl
) {
}
