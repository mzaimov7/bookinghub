package com.martinzaimov.bookinghub.dto;

import java.time.LocalDateTime;

public record AdminUserProfileOTD(
        Long userId,
        String username,
        String email,
        String role,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime lastLoginAt,
        String displayName,
        String city,
        String address,
        String phone,
        String photoUrl,
        String bio,
        Integer listingCount,
        String banReason,
        LocalDateTime bannedAt
) {
}
