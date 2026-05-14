package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    public enum Status { VISIBLE, HIDDEN }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(name = "author_user_id", nullable = false)
    private Long authorUserId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.VISIBLE;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = Status.VISIBLE;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getServiceId() { return serviceId; }
    public Long getAuthorUserId() { return authorUserId; }
    public Long getParentId() { return parentId; }
    public String getText() { return text; }
    public Status getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public void setAuthorUserId(Long authorUserId) { this.authorUserId = authorUserId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public void setText(String text) { this.text = text; }
    public void setStatus(Status status) { this.status = status; }
}
