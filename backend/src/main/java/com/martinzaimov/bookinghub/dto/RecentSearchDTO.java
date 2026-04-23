package com.martinzaimov.bookinghub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecentSearchDTO(
        Long id,
        String query,
        String city,
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        LocalDateTime createdAt
) {
}
