package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginRequest {

    @NotBlank
    @Size(max = 255)
    public String identifier;

    @NotBlank
    @Size(min = 6, max = 100)
    public String password;
}
