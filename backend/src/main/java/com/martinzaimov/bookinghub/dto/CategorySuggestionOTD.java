package com.martinzaimov.bookinghub.dto;

public record CategorySuggestionOTD(
        Long id,
        Long businessUserId,
        String businessName,
        String proposedName,
        String description,
        String status,
        String adminNote,
        String createdAt,
        String reviewedAt
) {
}
