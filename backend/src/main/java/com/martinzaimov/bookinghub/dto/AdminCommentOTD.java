package com.martinzaimov.bookinghub.dto;

public record AdminCommentOTD(
        Long id,
        Long serviceId,
        String serviceTitle,
        Long authorUserId,
        String authorName,
        String text,
        String status,
        String adminModerationReason,
        String createdAt,
        String moderatedAt
) {
}
