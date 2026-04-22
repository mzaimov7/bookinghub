package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class CreateServiceRequest {

    @NotNull
    public Long categoryId;

    @NotBlank
    public String title;

    public String description;

    @NotBlank
    public String city;

    @NotBlank
    public String address;

    @NotNull
    public BigDecimal price;

    @NotNull
    public Integer durationMinutes;

    public boolean active = true;

    // ✅ MULTI resources
    @NotNull
    public List<Long> resourceIds;

    // график (MVP)
    @NotBlank
    public String date; // "2026-03-02"

    public int slotMinutes = 30;

    // ✅ снимки (оставяме, за да не счупим upload/cover)
    public List<String> imageUrls;
    public Integer coverIndex;
}