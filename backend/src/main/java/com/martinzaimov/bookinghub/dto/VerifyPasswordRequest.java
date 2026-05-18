package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyPasswordRequest {

    @NotBlank
    public String password;
}
