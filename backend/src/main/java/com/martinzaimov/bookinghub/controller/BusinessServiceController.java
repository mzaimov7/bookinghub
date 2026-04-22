package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.CreateServiceRequest;
import com.martinzaimov.bookinghub.service.BusinessServiceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/business")
public class BusinessServiceController {

    private final BusinessServiceService businessServiceService;

    public BusinessServiceController(BusinessServiceService businessServiceService) {
        this.businessServiceService = businessServiceService;
    }

    /**
     * JSON body (CreateServiceRequest)
     *
     * Temporary auth (until JWT):
     *  - X-Business-User-Id header
     */
    @PostMapping("/services")
    public Map<String, Object> createService(
            @RequestHeader("X-Business-User-Id") Long businessUserId,
            @Valid @RequestBody CreateServiceRequest req
    ) {
        Long id = businessServiceService.createService(businessUserId, req);
        return Map.of("id", id);
    }
}