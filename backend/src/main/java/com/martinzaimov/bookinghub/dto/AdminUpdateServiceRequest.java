package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class AdminUpdateServiceRequest {
    @NotNull
    public Long categoryId;

    public String categorySuggestion;

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

    public Boolean active;
    public String approvalStatus;
    public String approvalNote;
    public String opensAt;
    public String closesAt;
    public Integer slotIntervalMinutes;
    public Integer bookingHorizonDays;
}
