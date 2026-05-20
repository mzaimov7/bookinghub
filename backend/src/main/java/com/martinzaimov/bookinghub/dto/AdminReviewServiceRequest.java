package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminReviewServiceRequest {
    @NotBlank
    public String note;
}
