package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_profiles")
public class BusinessProfile {

    public enum ProviderType {
        COMPANY, INDIVIDUAL
    }

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false)
    private ProviderType providerType;

    @Column(name = "business_name", length = 255, nullable = false)
    private String businessName;

    @Column(name = "city", length = 120, nullable = false)
    private String city;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public BusinessProfile() {}

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

    public Long getUserId() { return userId; }
    public User getUser() { return user; }
    public ProviderType getProviderType() { return providerType; }
    public String getBusinessName() { return businessName; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }

    public void setUser(User user) { this.user = user; }
    public void setProviderType(ProviderType providerType) { this.providerType = providerType; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public void setCity(String city) { this.city = city; }
    public void setAddress(String address) { this.address = address; }
    public void setPhone(String phone) { this.phone = phone; }
}
