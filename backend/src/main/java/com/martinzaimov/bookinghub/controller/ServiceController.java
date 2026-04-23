package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.ServiceOTD;
import com.martinzaimov.bookinghub.service.ClientProfileService;
import com.martinzaimov.bookinghub.service.ServiceService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;
    private final ClientProfileService clientProfileService;

    public ServiceController(ServiceService serviceService, ClientProfileService clientProfileService) {
        this.serviceService = serviceService;
        this.clientProfileService = clientProfileService;
    }

    @GetMapping
    public List<ServiceOTD> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return serviceService.search(query, categoryId, city, minPrice, maxPrice);
    }

    @GetMapping("/{id}")
    public ServiceOTD get(@PathVariable Long id) {
        return serviceService.getById(id);
    }

    @GetMapping("/{id}/slots")
    public List<?> getAvailableSlots(@PathVariable Long id) {
        return clientProfileService.getAvailableSlots(id);
    }
}
