package com.martinzaimov.bookinghub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "service_images")
public class ServiceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="service_id", nullable = false)
    private Long serviceId;

    @Column(name="image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name="is_cover", nullable = false)
    private boolean cover;

    @Column(name="sort_order", nullable = false)
    private int sortOrder;

    public ServiceImage() {}

    public Long getId() { return id; }
    public Long getServiceId() { return serviceId; }
    public String getImageUrl() { return imageUrl; }
    public boolean isCover() { return cover; }
    public int getSortOrder() { return sortOrder; }

    public void setId(Long id) { this.id = id; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setCover(boolean cover) { this.cover = cover; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}