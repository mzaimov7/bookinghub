package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resource_weekly_off_days")
public class ResourceWeeklyOffDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(name = "day_of_week", nullable = false, columnDefinition = "TINYINT")
    private Integer dayOfWeek;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getResourceId() { return resourceId; }
    public Integer getDayOfWeek() { return dayOfWeek; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public void setDayOfWeek(Integer dayOfWeek) { this.dayOfWeek = dayOfWeek; }
}
