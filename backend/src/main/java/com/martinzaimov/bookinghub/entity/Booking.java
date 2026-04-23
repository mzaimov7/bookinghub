package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    public enum Status { PENDING, CONFIRMED, REJECTED, CANCELED }
    public enum Source { ONLINE, WALK_IN }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_id", nullable = false)
    private Long slotId;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(name = "client_user_id", nullable = false)
    private Long clientUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "status_reason", columnDefinition = "TEXT")
    private String statusReason;

    @Column(name = "client_note", columnDefinition = "TEXT")
    private String clientNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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
    public Long getSlotId() { return slotId; }
    public Long getServiceId() { return serviceId; }
    public Long getClientUserId() { return clientUserId; }
    public Status getStatus() { return status; }
    public String getStatusReason() { return statusReason; }
    public String getClientNote() { return clientNote; }
    public Source getSource() { return source; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public void setClientUserId(Long clientUserId) { this.clientUserId = clientUserId; }
    public void setStatus(Status status) { this.status = status; }
    public void setStatusReason(String statusReason) { this.statusReason = statusReason; }
    public void setClientNote(String clientNote) { this.clientNote = clientNote; }
    public void setSource(Source source) { this.source = source; }
}
