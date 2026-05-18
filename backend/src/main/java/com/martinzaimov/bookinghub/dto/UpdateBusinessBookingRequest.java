package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateBusinessBookingRequest {

    @NotBlank
    public String status;

    public String reason;
}
