package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotNull;

public class CreateBookingRequest {

    @NotNull
    public Long serviceId;

    @NotNull
    public Long slotId;

    public String clientNote;
}
