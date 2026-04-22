package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.CreateResourceRequest;
import com.martinzaimov.bookinghub.dto.ResourceOTD;
import com.martinzaimov.bookinghub.dto.UpdateResourceRequest;
import com.martinzaimov.bookinghub.entity.Resource;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.ResourceRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import jakarta.transaction.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
public class BusinessResourceService {

    private final ResourceRepository resources;
    private final UserRepository users;

    public BusinessResourceService(ResourceRepository resources, UserRepository users) {
        this.resources = resources;
        this.users = users;
    }

    public List<ResourceOTD> list(Long businessUserId) {
        assertBusiness(businessUserId);
        return resources.findAllByBusinessUserIdOrderByNameAsc(businessUserId)
                .stream()
                .map(r -> new ResourceOTD(
                        r.getId(),
                        r.getType().name(),
                        r.getName(),
                        r.isActive(),
                        r.getPhotoUrl()
                ))
                .toList();
    }

    @Transactional
    public Long create(Long businessUserId, CreateResourceRequest req) {
        assertBusiness(businessUserId);

        Resource.Type type;
        try {
            type = Resource.Type.valueOf(req.type.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid type. Use STAFF or TEAM.");
        }

        Resource r = new Resource();
        r.setBusinessUserId(businessUserId);
        r.setType(type);
        r.setName(req.name.trim());
        r.setActive(true);

        if (req.photoUrl != null && !req.photoUrl.trim().isEmpty()) {
            r.setPhotoUrl(req.photoUrl.trim());
        }

        return resources.save(r).getId();
    }

    @Transactional
    public void update(Long businessUserId, Long resourceId, UpdateResourceRequest req) {
        assertBusiness(businessUserId);

        Resource r = resources.findByIdAndBusinessUserId(resourceId, businessUserId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (req.name != null) {
            String n = req.name.trim();
            if (!n.isEmpty()) r.setName(n);
        }

        if (req.active != null) {
            r.setActive(req.active);
        }

        if (req.photoUrl != null) {
            String p = req.photoUrl.trim();
            r.setPhotoUrl(p.isEmpty() ? null : p);
        }

        resources.save(r);
    }

    private void assertBusiness(Long businessUserId) {
        User u = users.findById(businessUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (u.getRole() != User.Role.BUSINESS) {
            throw new IllegalArgumentException("Only BUSINESS can manage resources");
        }
    }
}