package com.martinzaimov.bookinghub.dto;

public record BusinessServiceStatsDTO(
        Long serviceId,
        String title,
        Double averageRating,
        Long bookingCount,
        Long commentCount,
        Long reviewCount
) {
}
