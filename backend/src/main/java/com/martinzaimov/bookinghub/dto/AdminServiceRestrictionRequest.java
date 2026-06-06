package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdminServiceRestrictionRequest {
    @NotNull
    public Long serviceId;

    @NotNull
    public Long clientUserId;

    @NotBlank
    public String reason;

    public Boolean active;
}
