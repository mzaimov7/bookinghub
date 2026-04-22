package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "services")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_user_id", nullable = false)
    private Long businessUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 120)
    private String city;

    @Column(length = 255)
    private String address;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public Service() {}

    public Long getId() { return id; }
    public Long getBusinessUserId() { return businessUserId; }
    public Category getCategory() { return category; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public BigDecimal getPrice() { return price; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public boolean isActive() { return active; }

    public void setId(Long id) { this.id = id; }
    public void setBusinessUserId(Long businessUserId) { this.businessUserId = businessUserId; }
    public void setCategory(Category category) { this.category = category; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCity(String city) { this.city = city; }
    public void setAddress(String address) { this.address = address; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public void setActive(boolean active) { this.active = active; }
}