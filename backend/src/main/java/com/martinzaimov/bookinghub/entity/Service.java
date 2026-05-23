package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "services")
public class Service {

    public enum ApprovalStatus { PENDING, APPROVED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_user_id", nullable = false)
    private Long businessUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "category_suggestion", columnDefinition = "TEXT")
    private String categorySuggestion;

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

    @Column(name = "opens_at")
    private LocalTime opensAt;

    @Column(name = "closes_at")
    private LocalTime closesAt;

    @Column(name = "slot_interval_minutes", nullable = false)
    private Integer slotIntervalMinutes = 30;

    @Column(name = "booking_horizon_days", nullable = false)
    private Integer bookingHorizonDays = 90;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "approval_note", columnDefinition = "TEXT")
    private String approvalNote;

    @Column(name = "approval_reviewed_by_user_id")
    private Long approvalReviewedByUserId;

    @Column(name = "approval_reviewed_at")
    private LocalDateTime approvalReviewedAt;

    @Column(name = "admin_deletion_reason", columnDefinition = "TEXT")
    private String adminDeletionReason;

    @Column(name = "admin_deleted_by_user_id")
    private Long adminDeletedByUserId;

    @Column(name = "admin_deleted_at")
    private LocalDateTime adminDeletedAt;

    public Service() {}

    public Long getId() { return id; }
    public Long getBusinessUserId() { return businessUserId; }
    public Category getCategory() { return category; }
    public String getCategorySuggestion() { return categorySuggestion; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public BigDecimal getPrice() { return price; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public LocalTime getOpensAt() { return opensAt; }
    public LocalTime getClosesAt() { return closesAt; }
    public Integer getSlotIntervalMinutes() { return slotIntervalMinutes; }
    public Integer getBookingHorizonDays() { return bookingHorizonDays; }
    public boolean isActive() { return active; }
    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public String getApprovalNote() { return approvalNote; }
    public Long getApprovalReviewedByUserId() { return approvalReviewedByUserId; }
    public LocalDateTime getApprovalReviewedAt() { return approvalReviewedAt; }
    public String getAdminDeletionReason() { return adminDeletionReason; }
    public Long getAdminDeletedByUserId() { return adminDeletedByUserId; }
    public LocalDateTime getAdminDeletedAt() { return adminDeletedAt; }

    public void setId(Long id) { this.id = id; }
    public void setBusinessUserId(Long businessUserId) { this.businessUserId = businessUserId; }
    public void setCategory(Category category) { this.category = category; }
    public void setCategorySuggestion(String categorySuggestion) { this.categorySuggestion = categorySuggestion; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCity(String city) { this.city = city; }
    public void setAddress(String address) { this.address = address; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public void setOpensAt(LocalTime opensAt) { this.opensAt = opensAt; }
    public void setClosesAt(LocalTime closesAt) { this.closesAt = closesAt; }
    public void setSlotIntervalMinutes(Integer slotIntervalMinutes) { this.slotIntervalMinutes = slotIntervalMinutes; }
    public void setBookingHorizonDays(Integer bookingHorizonDays) { this.bookingHorizonDays = bookingHorizonDays; }
    public void setActive(boolean active) { this.active = active; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
    public void setApprovalNote(String approvalNote) { this.approvalNote = approvalNote; }
    public void setApprovalReviewedByUserId(Long approvalReviewedByUserId) { this.approvalReviewedByUserId = approvalReviewedByUserId; }
    public void setApprovalReviewedAt(LocalDateTime approvalReviewedAt) { this.approvalReviewedAt = approvalReviewedAt; }
    public void setAdminDeletionReason(String adminDeletionReason) { this.adminDeletionReason = adminDeletionReason; }
    public void setAdminDeletedByUserId(Long adminDeletedByUserId) { this.adminDeletedByUserId = adminDeletedByUserId; }
    public void setAdminDeletedAt(LocalDateTime adminDeletedAt) { this.adminDeletedAt = adminDeletedAt; }
}
