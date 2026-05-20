package com.martinzaimov.bookinghub.dto;

public record AdminUserProfileOTD(
        Long userId,
        String username,
        String email,
        String role,
        boolean active,
        String displayName,
        String city,
        String address,
        String phone,
        String photoUrl,
        String bio,
        Integer listingCount
) {
}
