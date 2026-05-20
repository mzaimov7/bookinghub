package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    public enum Status { VISIBLE, HIDDEN }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(name = "author_user_id", nullable = false)
    private Long authorUserId;

    @Column(nullable = false)
    private Byte rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.VISIBLE;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public Long getServiceId() { return serviceId; }
    public Long getAuthorUserId() { return authorUserId; }
    public Byte getRating() { return rating; }
    public String getComment() { return comment; }
    public Status getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public void setAuthorUserId(Long authorUserId) { this.authorUserId = authorUserId; }
    public void setRating(Byte rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setStatus(Status status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
