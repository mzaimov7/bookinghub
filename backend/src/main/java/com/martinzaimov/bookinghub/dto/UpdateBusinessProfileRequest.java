package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateBusinessProfileRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    public String username;

    @NotBlank
    @Email
    @Size(max = 255)
    public String email;

    @NotBlank
    public String providerType;

    @NotBlank
    public String businessName;

    @NotBlank
    public String city;

    public String address;

    public String phone;
}
