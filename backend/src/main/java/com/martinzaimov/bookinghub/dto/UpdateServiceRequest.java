package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class UpdateServiceRequest {

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

    @NotNull
    public List<Long> resourceIds;

    @NotBlank
    public String opensAt;

    @NotBlank
    public String closesAt;

    public int slotIntervalMinutes = 30;

    public int bookingHorizonDays = 90;

    public List<String> imageUrls;
    public Integer coverIndex;
}
