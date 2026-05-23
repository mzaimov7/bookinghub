package com.martinzaimov.bookinghub.dto;

import java.math.BigDecimal;
import java.util.List;

public class ServiceOTD {
    private Long id;
    private Long categoryId;
    private Long businessUserId;
    private String categorySuggestion;

    private String title;
    private String description;
    private String city;
    private String address;

    private BigDecimal price;
    private Integer durationMinutes;
    private String opensAt;
    private String closesAt;
    private Integer slotIntervalMinutes;
    private Integer bookingHorizonDays;
    private boolean active;

    // ✅ ново поле
    private String coverImageUrl;
    private List<String> imageUrls;
    private List<Long> resourceIds;
    private String approvalStatus;
    private String approvalNote;
    private String approvalReviewedAt;
    private String adminDeletionReason;
    private String adminDeletedAt;

    public ServiceOTD() {}

    public ServiceOTD(Long id, Long categoryId, Long businessUserId,
                      String title, String description, String city, String address,
                      BigDecimal price, Integer durationMinutes,
                      String opensAt, String closesAt, Integer slotIntervalMinutes, Integer bookingHorizonDays,
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
        this.opensAt = opensAt;
        this.closesAt = closesAt;
        this.slotIntervalMinutes = slotIntervalMinutes;
        this.bookingHorizonDays = bookingHorizonDays;
        this.active = false;
        this.coverImageUrl = coverImageUrl;
        this.imageUrls = List.of();
        this.resourceIds = List.of();
        this.approvalStatus = null;
        this.approvalNote = null;
        this.approvalReviewedAt = null;
        this.adminDeletionReason = null;
        this.adminDeletedAt = null;
    }

    public ServiceOTD(Long id, Long categoryId, Long businessUserId,
                      String title, String description, String city, String address,
                      BigDecimal price, Integer durationMinutes,
                      String opensAt, String closesAt, Integer slotIntervalMinutes, Integer bookingHorizonDays,
                      String coverImageUrl, List<String> imageUrls) {
        this.id = id;
        this.categoryId = categoryId;
        this.businessUserId = businessUserId;
        this.title = title;
        this.description = description;
        this.city = city;
        this.address = address;
        this.price = price;
        this.durationMinutes = durationMinutes;
        this.opensAt = opensAt;
        this.closesAt = closesAt;
        this.slotIntervalMinutes = slotIntervalMinutes;
        this.bookingHorizonDays = bookingHorizonDays;
        this.active = false;
        this.coverImageUrl = coverImageUrl;
        this.imageUrls = imageUrls == null ? List.of() : imageUrls;
        this.resourceIds = List.of();
        this.approvalStatus = null;
        this.approvalNote = null;
        this.approvalReviewedAt = null;
        this.adminDeletionReason = null;
        this.adminDeletedAt = null;
    }

    public ServiceOTD(Long id, Long categoryId, Long businessUserId,
                      String title, String description, String city, String address,
                      BigDecimal price, Integer durationMinutes,
                      String opensAt, String closesAt, Integer slotIntervalMinutes, Integer bookingHorizonDays,
                      String coverImageUrl, List<String> imageUrls, List<Long> resourceIds) {
        this.id = id;
        this.categoryId = categoryId;
        this.businessUserId = businessUserId;
        this.title = title;
        this.description = description;
        this.city = city;
        this.address = address;
        this.price = price;
        this.durationMinutes = durationMinutes;
        this.opensAt = opensAt;
        this.closesAt = closesAt;
        this.slotIntervalMinutes = slotIntervalMinutes;
        this.bookingHorizonDays = bookingHorizonDays;
        this.active = false;
        this.coverImageUrl = coverImageUrl;
        this.imageUrls = imageUrls == null ? List.of() : imageUrls;
        this.resourceIds = resourceIds == null ? List.of() : resourceIds;
        this.approvalStatus = null;
        this.approvalNote = null;
        this.approvalReviewedAt = null;
        this.adminDeletionReason = null;
        this.adminDeletedAt = null;
    }

    public Long getId() { return id; }
    public Long getCategoryId() { return categoryId; }
    public Long getBusinessUserId() { return businessUserId; }
    public String getCategorySuggestion() { return categorySuggestion; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public BigDecimal getPrice() { return price; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public String getOpensAt() { return opensAt; }
    public String getClosesAt() { return closesAt; }
    public Integer getSlotIntervalMinutes() { return slotIntervalMinutes; }
    public Integer getBookingHorizonDays() { return bookingHorizonDays; }
    public boolean isActive() { return active; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public List<String> getImageUrls() { return imageUrls; }
    public List<Long> getResourceIds() { return resourceIds; }
    public String getApprovalStatus() { return approvalStatus; }
    public String getApprovalNote() { return approvalNote; }
    public String getApprovalReviewedAt() { return approvalReviewedAt; }
    public String getAdminDeletionReason() { return adminDeletionReason; }
    public String getAdminDeletedAt() { return adminDeletedAt; }

    public void setId(Long id) { this.id = id; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setBusinessUserId(Long businessUserId) { this.businessUserId = businessUserId; }
    public void setCategorySuggestion(String categorySuggestion) { this.categorySuggestion = categorySuggestion; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCity(String city) { this.city = city; }
    public void setAddress(String address) { this.address = address; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public void setOpensAt(String opensAt) { this.opensAt = opensAt; }
    public void setClosesAt(String closesAt) { this.closesAt = closesAt; }
    public void setSlotIntervalMinutes(Integer slotIntervalMinutes) { this.slotIntervalMinutes = slotIntervalMinutes; }
    public void setBookingHorizonDays(Integer bookingHorizonDays) { this.bookingHorizonDays = bookingHorizonDays; }
    public void setActive(boolean active) { this.active = active; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls == null ? List.of() : imageUrls; }
    public void setResourceIds(List<Long> resourceIds) { this.resourceIds = resourceIds == null ? List.of() : resourceIds; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public void setApprovalNote(String approvalNote) { this.approvalNote = approvalNote; }
    public void setApprovalReviewedAt(String approvalReviewedAt) { this.approvalReviewedAt = approvalReviewedAt; }
    public void setAdminDeletionReason(String adminDeletionReason) { this.adminDeletionReason = adminDeletionReason; }
    public void setAdminDeletedAt(String adminDeletedAt) { this.adminDeletedAt = adminDeletedAt; }
}
