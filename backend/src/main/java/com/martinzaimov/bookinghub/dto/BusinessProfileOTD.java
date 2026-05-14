package com.martinzaimov.bookinghub.dto;

public record BusinessProfileOTD(
        Long userId,
        String username,
        String email,
        String role,
        String providerType,
        String businessName,
        String city,
        String address,
        String phone,
        String photoUrl
) {
}
