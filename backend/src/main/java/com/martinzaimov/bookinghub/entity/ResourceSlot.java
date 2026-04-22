package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="resource_slots")
public class ResourceSlot {

    public enum Status { AVAILABLE, HELD, BOOKED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="resource_id", nullable = false)
    private Long resourceId;

    @Column(name="service_id", nullable = false)
    private Long serviceId;

    @Column(name="start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name="end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable = false)
    private Status status;

    @Column(name="hold_expires_at")
    private LocalDateTime holdExpiresAt;

    public ResourceSlot() {}

    public Long getId() { return id; }
    public Long getResourceId() { return resourceId; }
    public Long getServiceId() { return serviceId; }
    public LocalDateTime getStartAt() { return startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public Status getStatus() { return status; }
    public LocalDateTime getHoldExpiresAt() { return holdExpiresAt; }

    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
    public void setEndAt(LocalDateTime endAt) { this.endAt = endAt; }
    public void setStatus(Status status) { this.status = status; }
    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) { this.holdExpiresAt = holdExpiresAt; }
}