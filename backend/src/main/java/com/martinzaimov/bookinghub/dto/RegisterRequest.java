package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank @Size(min=3, max=100)
    public String username;

    @NotBlank @Email @Size(max=255)
    public String email;

    @NotBlank @Size(min=6, max=100)
    public String password;

    @NotBlank
    public String role; // CLIENT или BUSINESS

    // CLIENT
    public String firstName;
    public String lastName;
    public String phone;
    public String photoUrl;
    public String bio;

    // BUSINESS
    public String providerType;   // COMPANY или INDIVIDUAL
    public String businessName;
    public String city;
    public String address;
    public String businessPhone;
    public String businessPhotoUrl;
}
