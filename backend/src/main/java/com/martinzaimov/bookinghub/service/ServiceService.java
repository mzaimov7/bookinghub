package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.ServiceOTD;
import com.martinzaimov.bookinghub.repo.ServiceImageRepository;
import com.martinzaimov.bookinghub.repo.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ServiceService {

    private final ServiceRepository repo;
    private final ServiceImageRepository images;

    public ServiceService(ServiceRepository repo, ServiceImageRepository images) {
        this.repo = repo;
        this.images = images;
    }

    public List<ServiceOTD> search(String query, Long categoryId, String city) {
        String q = normalize(query);
        String c = normalize(city);

        return repo.search(q, categoryId, c)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public ServiceOTD getById(Long id) {
        com.martinzaimov.bookinghub.entity.Service s = repo.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));
        return toDto(s);
    }

    private ServiceOTD toDto(com.martinzaimov.bookinghub.entity.Service s) {
        String coverUrl = images.findFirstByServiceIdAndCoverTrueOrderBySortOrderAsc(s.getId())
                .map(img -> img.getImageUrl()) // "/uploads/..."
                .orElse(null);

        return new ServiceOTD(
                s.getId(),
                s.getCategory() != null ? s.getCategory().getId() : null,
                s.getBusinessUserId(),
                s.getTitle(),
                s.getDescription(),
                s.getCity(),
                s.getAddress(),
                s.getPrice(),
                s.getDurationMinutes(),
                coverUrl
        );
    }

    private String normalize(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }
}