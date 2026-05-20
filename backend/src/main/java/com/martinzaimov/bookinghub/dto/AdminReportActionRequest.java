package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminReportActionRequest {
    @NotBlank
    public String status;
    public String resolutionNote;
}
