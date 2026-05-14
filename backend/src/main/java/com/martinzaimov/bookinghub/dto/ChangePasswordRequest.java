package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {

    @NotBlank
    public String currentPassword;

    @NotBlank
    @Size(min = 6, max = 100)
    public String newPassword;

    @NotBlank
    public String confirmPassword;
}
