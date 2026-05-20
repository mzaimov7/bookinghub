package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCategorySuggestionRequest {
    @NotBlank
    public String suggestion;
}
