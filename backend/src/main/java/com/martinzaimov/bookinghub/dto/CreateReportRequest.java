package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateReportRequest {

    @NotBlank
    public String targetType;

    @NotNull
    public Long targetId;

    @NotBlank
    @Size(max = 1500)
    public String reasonText;
}
