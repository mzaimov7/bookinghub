package com.martinzaimov.bookinghub.dto;

import java.time.LocalDateTime;

public record AdminServiceRestrictionOTD(
        Long id,
        Long serviceId,
        String serviceTitle,
        Long clientUserId,
        String clientName,
        String clientEmail,
        String reason,
        boolean active,
        Long createdByUserId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
