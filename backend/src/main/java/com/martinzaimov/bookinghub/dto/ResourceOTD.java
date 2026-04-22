package com.martinzaimov.bookinghub.dto;

public class ResourceOTD {
    public Long id;
    public String type;   // STAFF / TEAM
    public String name;
    public boolean active;
    public String photoUrl; // ✅ ново

    public ResourceOTD() {}

    public ResourceOTD(Long id, String type, String name, boolean active, String photoUrl) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.active = active;
        this.photoUrl = photoUrl;

    }
}