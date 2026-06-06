package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    @NotBlank(message = "Линкът за смяна на парола е невалиден")
    public String token;

    @NotBlank(message = "Въведи нова парола")
    @Size(max = 100)
    public String newPassword;

    @NotBlank(message = "Потвърди новата парола")
    @Size(max = 100)
    public String confirmPassword;
}
