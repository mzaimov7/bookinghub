package com.martinzaimov.bookinghub.dto;

public record AdminCategoryOTD(
        Long id,
        String name,
        String description,
        boolean active
) {
}
