package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
public class Resource {

    public enum Type { STAFF, TEAM }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_user_id", nullable = false)
    private Long businessUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private Type type;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    public Resource() {}

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getBusinessUserId() { return businessUserId; }
    public Type getType() { return type; }
    public String getName() { return name; }
    public boolean isActive() { return active; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public void setBusinessUserId(Long businessUserId) { this.businessUserId = businessUserId; }
    public void setType(Type type) { this.type = type; }
    public void setName(String name) { this.name = name; }
    public void setActive(boolean active) { this.active = active; }
}