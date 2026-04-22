package com.martinzaimov.bookinghub.dto;

import java.math.BigDecimal;

public class ServiceOTD {
    private Long id;
    private Long categoryId;
    private Long businessUserId;

    private String title;
    private String description;
    private String city;
    private String address;

    private BigDecimal price;
    private Integer durationMinutes;

    // ✅ ново поле
    private String coverImageUrl;

    public ServiceOTD() {}

    public ServiceOTD(Long id, Long categoryId, Long businessUserId,
                      String title, String description, String city, String address,
                      BigDecimal price, Integer durationMinutes,
                      String coverImageUrl) {
        this.id = id;
        this.categoryId = categoryId;
        this.businessUserId = businessUserId;
        this.title = title;
        this.description = description;
        this.city = city;
        this.address = address;
        this.price = price;
        this.durationMinutes = durationMinutes;
        this.coverImageUrl = coverImageUrl;
    }

    public Long getId() { return id; }
    public Long getCategoryId() { return categoryId; }
    public Long getBusinessUserId() { return businessUserId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public BigDecimal getPrice() { return price; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public String getCoverImageUrl() { return coverImageUrl; }

    public void setId(Long id) { this.id = id; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setBusinessUserId(Long businessUserId) { this.businessUserId = businessUserId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCity(String city) { this.city = city; }
    public void setAddress(String address) { this.address = address; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
}