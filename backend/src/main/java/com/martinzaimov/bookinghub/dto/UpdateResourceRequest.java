package com.martinzaimov.bookinghub.dto;

import java.util.List;

public class UpdateResourceRequest {
    public String name;
    public Boolean active;
    public String photoUrl;
    public List<Integer> weeklyOffDays;
    public List<String> dayOffDates;
}
