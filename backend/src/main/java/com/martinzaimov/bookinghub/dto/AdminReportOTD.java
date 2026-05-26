package com.martinzaimov.bookinghub.dto;

import java.util.List;

public record AdminReportOTD(
        Long id,
        Long reporterUserId,
        String reporterName,
        String targetType,
        Long targetId,
        String targetLabel,
        String targetText,
        String serviceLabel,
        String businessLabel,
        String serviceCoverImageUrl,
        Long serviceId,
        Long businessUserId,
        String reporterRole,
        String targetUserRole,
        List<AdminReportListingOTD> targetUserListings,
        String reasonText,
        String status,
        String resolutionNote,
        String createdAt
) {
}
