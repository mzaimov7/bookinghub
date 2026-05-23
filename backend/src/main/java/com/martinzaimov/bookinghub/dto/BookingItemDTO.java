package com.martinzaimov.bookinghub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingItemDTO(
        Long id,
        Long serviceId,
        Long slotId,
        String status,
        String statusReason,
        String clientNote,
        LocalDateTime createdAt,
        LocalDateTime startAt,
        LocalDateTime endAt,
        String title,
        String city,
        String address,
        BigDecimal price,
        Integer durationMinutes,
        String coverImageUrl,
        Long reviewId,
        Byte reviewRating,
        String reviewComment
) {
}
