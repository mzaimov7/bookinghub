package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ForgotPasswordRequest {
    @NotBlank(message = "Въведи имейл адрес")
    @Email(message = "Въведи валиден имейл адрес")
    @Size(max = 255)
    public String email;
}
