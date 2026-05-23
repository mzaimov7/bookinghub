package com.martinzaimov.bookinghub.dto;

public record ReviewOTD(
        Long id,
        Long bookingId,
        Long serviceId,
        Long authorUserId,
        String authorName,
        String authorPhotoUrl,
        Byte rating,
        String comment,
        String status,
        String createdAt
) {
}
