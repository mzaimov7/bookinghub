package com.martinzaimov.bookinghub.dto;

import java.time.LocalDateTime;

public record AvailableSlotDTO(
        Long id,
        Long resourceId,
        LocalDateTime startAt,
        LocalDateTime endAt
) {
}
