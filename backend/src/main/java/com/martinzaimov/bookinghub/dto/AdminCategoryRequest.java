package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminCategoryRequest {
    @NotBlank
    public String name;
    public String description;
    public Boolean active;
}
