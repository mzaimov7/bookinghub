package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.ServiceOTD;
import com.martinzaimov.bookinghub.entity.ServiceImage;
import com.martinzaimov.bookinghub.repo.ServiceImageRepository;
import com.martinzaimov.bookinghub.repo.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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

    public List<ServiceOTD> search(String query, Long categoryId, String city, BigDecimal minPrice, BigDecimal maxPrice) {
        String q = normalize(query);
        String c = normalize(city);

        return repo.search(q, categoryId, c, minPrice, maxPrice)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public ServiceOTD getById(Long id) {
        com.martinzaimov.bookinghub.entity.Service s = repo.findByIdAndActiveTrueAndApprovalStatus(id, com.martinzaimov.bookinghub.entity.Service.ApprovalStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));
        return toDetailedDto(s);
    }

    private ServiceOTD toDto(com.martinzaimov.bookinghub.entity.Service s) {
        String coverUrl = images.findFirstByServiceIdAndCoverTrueOrderBySortOrderAsc(s.getId())
                .map(img -> img.getImageUrl()) // "/uploads/..."
                .orElse(null);

        ServiceOTD dto = new ServiceOTD(
                s.getId(),
                s.getCategory() != null ? s.getCategory().getId() : null,
                s.getBusinessUserId(),
                s.getTitle(),
                s.getDescription(),
                s.getCity(),
                s.getAddress(),
                s.getPrice(),
                s.getDurationMinutes(),
                s.getOpensAt() == null ? null : s.getOpensAt().toString(),
                s.getClosesAt() == null ? null : s.getClosesAt().toString(),
                s.getSlotIntervalMinutes(),
                s.getBookingHorizonDays(),
                coverUrl
        );
        dto.setActive(s.isActive());
        dto.setApprovalStatus(s.getApprovalStatus() == null ? null : s.getApprovalStatus().name());
        return dto;
    }

    private ServiceOTD toDetailedDto(com.martinzaimov.bookinghub.entity.Service s) {
        String coverUrl = images.findFirstByServiceIdAndCoverTrueOrderBySortOrderAsc(s.getId())
                .map(ServiceImage::getImageUrl)
                .orElse(null);
        java.util.List<String> imageUrls = images.findByServiceIdOrderBySortOrderAsc(s.getId())
                .stream()
                .map(ServiceImage::getImageUrl)
                .toList();

        ServiceOTD dto = new ServiceOTD(
                s.getId(),
                s.getCategory() != null ? s.getCategory().getId() : null,
                s.getBusinessUserId(),
                s.getTitle(),
                s.getDescription(),
                s.getCity(),
                s.getAddress(),
                s.getPrice(),
                s.getDurationMinutes(),
                s.getOpensAt() == null ? null : s.getOpensAt().toString(),
                s.getClosesAt() == null ? null : s.getClosesAt().toString(),
                s.getSlotIntervalMinutes(),
                s.getBookingHorizonDays(),
                coverUrl,
                imageUrls
        );
        dto.setActive(s.isActive());
        dto.setApprovalStatus(s.getApprovalStatus() == null ? null : s.getApprovalStatus().name());
        return dto;
    }

    private String normalize(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }
}
