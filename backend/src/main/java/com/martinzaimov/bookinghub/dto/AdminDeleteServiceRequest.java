package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminDeleteServiceRequest {
    @NotBlank
    public String reason;
}
