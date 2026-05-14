package com.martinzaimov.bookinghub.dto;

import java.util.List;

public class ResourceOTD {
    public Long id;
    public String type;   // STAFF / TEAM
    public String name;
    public boolean active;
    public String photoUrl;
    public List<Integer> weeklyOffDays;
    public List<String> dayOffDates;

    public ResourceOTD() {}

    public ResourceOTD(Long id, String type, String name, boolean active, String photoUrl, List<Integer> weeklyOffDays, List<String> dayOffDates) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.active = active;
        this.photoUrl = photoUrl;
        this.weeklyOffDays = weeklyOffDays == null ? List.of() : weeklyOffDays;
        this.dayOffDates = dayOffDates == null ? List.of() : dayOffDates;
    }
}
