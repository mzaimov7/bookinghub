package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpsertReviewRequest {
    @NotNull(message = "Оценката е задължителна")
    @Min(value = 1, message = "Оценката трябва да е поне 1")
    @Max(value = 5, message = "Оценката трябва да е най-много 5")
    public Byte rating;

    public String comment;
}
