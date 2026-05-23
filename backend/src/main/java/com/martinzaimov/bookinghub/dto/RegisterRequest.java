package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Потребителското име е задължително")
    @Size(min=3, max=100, message = "Потребителското име трябва да е между 3 и 100 символа")
    public String username;

    @NotBlank(message = "Имейлът е задължителен")
    @Email(message = "Въведи валиден имейл")
    @Size(max=255, message = "Имейлът е твърде дълъг")
    public String email;

    @NotBlank(message = "Паролата е задължителна")
    @Size(min=8, max=100, message = "Паролата трябва да е поне 8 символа")
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
    public String companyLegalName;
    public String companyEik;
    public String companyRepresentative;
    public String city;
    public String address;
    public String businessPhone;
    public String businessPhotoUrl;
    public String businessDescription;
    public Long businessCategoryId;
}
