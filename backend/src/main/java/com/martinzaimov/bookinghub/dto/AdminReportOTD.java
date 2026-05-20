package com.martinzaimov.bookinghub.dto;

public record AdminReportOTD(
        Long id,
        Long reporterUserId,
        String reporterName,
        String targetType,
        Long targetId,
        String targetLabel,
        String reasonText,
        String status,
        String resolutionNote,
        String createdAt
) {
}
