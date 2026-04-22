package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.CreateServiceRequest;
import com.martinzaimov.bookinghub.entity.ResourceSlot;
import com.martinzaimov.bookinghub.entity.Service;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.*;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@org.springframework.stereotype.Service
public class BusinessServiceService {

    private final ServiceRepository services;
    private final CategoryRepository categories;
    private final UserRepository users;
    private final ResourceRepository resources;
    private final ResourceSlotRepository slots;
    private final ServiceResourceDao serviceResourceDao;

    public BusinessServiceService(
            ServiceRepository services,
            CategoryRepository categories,
            UserRepository users,
            ResourceRepository resources,
            ResourceSlotRepository slots,
            ServiceResourceDao serviceResourceDao
    ) {
        this.services = services;
        this.categories = categories;
        this.users = users;
        this.resources = resources;
        this.slots = slots;
        this.serviceResourceDao = serviceResourceDao;
    }

    @Transactional
    public Long createService(Long businessUserId, CreateServiceRequest req) {

        // 1) validate business user
        User u = users.findById(businessUserId)
                .orElseThrow(() -> new IllegalArgumentException("Business user not found"));
        if (u.getRole() != User.Role.BUSINESS) {
            throw new IllegalArgumentException("Only BUSINESS can create services");
        }

        var cat = categories.findById(req.categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // 2) create Service
        Service s = new Service();
        s.setBusinessUserId(businessUserId);
        s.setCategory(cat);
        s.setTitle(req.title.trim());
        s.setDescription(req.description);
        s.setCity(req.city.trim());
        s.setAddress(req.address.trim());
        s.setPrice(req.price == null ? BigDecimal.ZERO : req.price);
        s.setDurationMinutes(req.durationMinutes);
        s.setActive(req.active);

        s = services.save(s);

        // 3) validate + link resources (service_resources)
        if (req.resourceIds == null || req.resourceIds.isEmpty()) {
            throw new IllegalArgumentException("resourceIds is required");
        }

        // ✅ МVP: генерираме слотове за избраната дата 09:00–18:00
        LocalDate d = LocalDate.parse(req.date.trim());
        int slotMinutes = req.slotMinutes <= 0 ? 30 : req.slotMinutes;

        LocalDateTime start = d.atTime(9, 0);
        LocalDateTime end = d.atTime(18, 0);

        for (Long rid : req.resourceIds) {
            if (rid == null) continue;

            // ресурсът трябва да е на същия бизнес
            var rOpt = resources.findByIdAndBusinessUserId(rid, businessUserId);
            if (rOpt.isEmpty()) {
                throw new IllegalArgumentException("Invalid resourceId (not owned by this business): " + rid);
            }

            // link resource към service (many-to-many)
            serviceResourceDao.link(s.getId(), rid);

            // generate slots for this resource
            generateSlotsForResource(rid, s.getId(), start, end, slotMinutes);
        }

        return s.getId();
    }

    private void generateSlotsForResource(Long resourceId, Long serviceId,
                                          LocalDateTime start, LocalDateTime end,
                                          int slotMinutes) {

        List<ResourceSlot> existing = slots.findByServiceIdAndResourceIdAndStartAtBetween(
                serviceId, resourceId, start, end
        );
        if (!existing.isEmpty()) return; // вече има слотове за тази дата

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