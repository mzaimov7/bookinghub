package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AdminUpdateUserRequest {
    @NotBlank
    @Size(max = 100)
    public String username;

    @NotBlank
    @Email
    @Size(max = 255)
    public String email;

    @NotBlank
    public String role;

    public Boolean active;
    public String banReason;

    public String firstName;
    public String lastName;
    public String bio;

    public String providerType;
    public String businessName;
    public String companyLegalName;
    public String companyEik;
    public String companyRepresentative;

    public String city;
    public String address;
    public String phone;
    public String photoUrl;
    public String description;
}
