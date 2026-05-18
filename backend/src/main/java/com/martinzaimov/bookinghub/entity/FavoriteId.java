package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class FavoriteId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "service_id")
    private Long serviceId;

    public FavoriteId() {}

    public FavoriteId(Long userId, Long serviceId) {
        this.userId = userId;
        this.serviceId = serviceId;
    }

    public Long getUserId() { return userId; }
    public Long getServiceId() { return serviceId; }

    public void setUserId(Long userId) { this.userId = userId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FavoriteId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(serviceId, that.serviceId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, serviceId);
    }
}
