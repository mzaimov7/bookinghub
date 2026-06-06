package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminUpdateCommentRequest {
    @NotBlank
    public String text;
    public String status;
    public String adminModerationReason;
}
