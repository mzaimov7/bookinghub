package com.martinzaimov.bookinghub.dto;

import java.time.LocalDateTime;

public record CommentDTO(
        Long id,
        Long serviceId,
        Long authorUserId,
        String authorName,
        String authorRole,
        String authorPhotoUrl,
        Long parentId,
        Long parentReviewId,
        String text,
        LocalDateTime createdAt
) {
}
