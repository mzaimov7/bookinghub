package com.martinzaimov.bookinghub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateResourceRequest {
    @NotNull
    public String type; // STAFF / TEAM

    @NotBlank
    public String name;
    public String photoUrl;
    public List<Integer> weeklyOffDays;
    public List<String> dayOffDates;
}
