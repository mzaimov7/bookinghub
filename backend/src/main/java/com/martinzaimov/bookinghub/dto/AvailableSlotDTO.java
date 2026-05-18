package com.martinzaimov.bookinghub.dto;

import java.time.LocalDateTime;

public record AvailableSlotDTO(
        String bookingKey,
        Long resourceId,
        String resourceName,
        String resourceType,
        String resourcePhotoUrl,
        LocalDateTime startAt,
        LocalDateTime endAt
) {
}
