package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.CreateServiceRequest;
import com.martinzaimov.bookinghub.entity.ResourceSlot;
import com.martinzaimov.bookinghub.entity.Service;
import com.martinzaimov.bookinghub.entity.ServiceImage;
import com.martinzaimov.bookinghub.repo.CategoryRepository;
import com.martinzaimov.bookinghub.repo.ResourceRepository;
import com.martinzaimov.bookinghub.repo.ResourceSlotRepository;
import com.martinzaimov.bookinghub.repo.ServiceImageRepository;
import com.martinzaimov.bookinghub.repo.ServiceRepository;
import com.martinzaimov.bookinghub.repo.ServiceResourceDao;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@org.springframework.stereotype.Service

public class BusinessListingService {

    private final ServiceRepository services;
    private final CategoryRepository categories;
    private final ServiceResourceDao serviceResourceDao;
    private final ServiceImageRepository images;
    private final ResourceRepository resources;
    private final ResourceSlotRepository slots;

    public BusinessListingService(
            ServiceRepository services,
            CategoryRepository categories,
            ServiceResourceDao serviceResourceDao,
            ServiceImageRepository images,
            ResourceRepository resources,
            ResourceSlotRepository slots
    ) {
        this.services = services;
        this.categories = categories;
        this.serviceResourceDao = serviceResourceDao;
        this.images = images;
        this.resources = resources;
        this.slots = slots;
    }

    @Transactional
    public Long createService(Long businessUserId, CreateServiceRequest req) {
        var cat = categories.findById(req.categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid category"));

        // 1) create service
        Service s = new Service();
        s.setBusinessUserId(businessUserId);
        s.setCategory(cat);
        s.setTitle(req.title.trim());
        s.setDescription(req.description);
        s.setCity(req.city.trim());
        s.setAddress(req.address.trim());
        s.setPrice(req.price);
        s.setDurationMinutes(req.durationMinutes);
        s.setActive(req.active);

        Service saved = services.save(s);

        // 2) link resources (multi)
        if (req.resourceIds == null || req.resourceIds.isEmpty()) {
            throw new IllegalArgumentException("resourceIds is required");
        }

        // MVP часови диапазон (временно): 09:00 - 18:00
        LocalDate d = LocalDate.parse(req.date.trim());
        int slotMinutes = req.slotMinutes <= 0 ? 30 : req.slotMinutes;

        LocalDateTime start = d.atTime(9, 0);
        LocalDateTime end = d.atTime(18, 0);

        for (Long rid : req.resourceIds) {
            if (rid == null) continue;

            // ресурсът трябва да е от този бизнес
            resources.findByIdAndBusinessUserId(rid, businessUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid resourceId: " + rid));

            // many-to-many link
            serviceResourceDao.link(saved.getId(), rid);

            // slots for this resource
            generateSlots(rid, saved.getId(), start, end, slotMinutes);
        }

        // 3) images (ако пращаш imageUrls)
        if (req.imageUrls != null && !req.imageUrls.isEmpty()) {
            int coverIdx = (req.coverIndex == null ? 0 : req.coverIndex);

            for (int i = 0; i < req.imageUrls.size(); i++) {
                String url = req.imageUrls.get(i);
                if (url == null || url.trim().isEmpty()) continue;

                ServiceImage img = new ServiceImage();
                img.setServiceId(saved.getId());
                img.setImageUrl(url.trim());
                img.setSortOrder(i);
                img.setCover(i == coverIdx);

                images.save(img);
            }
        }

        return saved.getId();
    }

    private void generateSlots(Long resourceId, Long serviceId,
                               LocalDateTime start, LocalDateTime end,
                               int slotMinutes) {

        var existing = slots.findByServiceIdAndResourceIdAndStartAtBetween(serviceId, resourceId, start, end);
        if (!existing.isEmpty()) return;

        LocalDateTime t = start;
        while (!t.plusMinutes(slotMinutes).isAfter(end)) {
            ResourceSlot rs = new ResourceSlot();
            rs.setResourceId(resourceId);
            rs.setServiceId(serviceId);
            rs.setStartAt(t);
            rs.setEndAt(t.plusMinutes(slotMinutes));
            rs.setStatus(ResourceSlot.Status.AVAILABLE);
            rs.setHoldExpiresAt(null);
            slots.save(rs);

            t = t.plusMinutes(slotMinutes);
        }
    }
}