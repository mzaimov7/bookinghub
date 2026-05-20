package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminHideCommentRequest {
    @NotBlank
    public String reason;
}
