package com.martinzaimov.bookinghub.dto;

public record ClientProfileDTO(
        Long userId,
        String username,
        String email,
        String role,
        String firstName,
        String lastName,
        String phone,
        String photoUrl
) {
}
