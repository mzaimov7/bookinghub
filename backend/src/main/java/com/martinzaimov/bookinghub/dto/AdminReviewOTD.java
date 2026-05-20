package com.martinzaimov.bookinghub.dto;

public record AdminReviewOTD(
        Long id,
        Long bookingId,
        Long serviceId,
        String serviceTitle,
        Long authorUserId,
        String authorName,
        Byte rating,
        String comment,
        String status,
        String createdAt
) {
}
