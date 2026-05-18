package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_day_offs")
public class ResourceDayOff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(name = "off_date", nullable = false)
    private LocalDate offDate;

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getResourceId() { return resourceId; }
    public LocalDate getOffDate() { return offDate; }
    public String getNote() { return note; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public void setOffDate(LocalDate offDate) { this.offDate = offDate; }
    public void setNote(String note) { this.note = note; }
}
