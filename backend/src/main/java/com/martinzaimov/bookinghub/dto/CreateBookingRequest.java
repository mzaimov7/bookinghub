package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CreateBookingRequest {

    @NotNull
    public Long serviceId;

    @NotNull
    public Long resourceId;

    @NotNull
    public LocalDateTime startAt;

    @NotNull
    public LocalDateTime endAt;

    public String clientNote;
}
