package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.ServiceOTD;
import com.martinzaimov.bookinghub.service.ServiceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @GetMapping
    public List<ServiceOTD> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String city
    ) {
        return serviceService.search(query, categoryId, city);
    }

    @GetMapping("/{id}")
    public ServiceOTD get(@PathVariable Long id) {
        return serviceService.getById(id);
    }
}