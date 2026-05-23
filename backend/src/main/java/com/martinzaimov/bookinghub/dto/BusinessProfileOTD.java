package com.martinzaimov.bookinghub.dto;

public record BusinessProfileOTD(
        Long userId,
        String username,
        String email,
        String role,
        String providerType,
        String businessName,
        String companyLegalName,
        String companyEik,
        String companyRepresentative,
        String city,
        String address,
        String phone,
        String description,
        String photoUrl
) {
}
