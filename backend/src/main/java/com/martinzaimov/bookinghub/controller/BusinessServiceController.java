package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.CreateServiceRequest;
import com.martinzaimov.bookinghub.dto.UpdateServiceRequest;
import com.martinzaimov.bookinghub.dto.UpdateBusinessBookingRequest;
import com.martinzaimov.bookinghub.service.BusinessServiceService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @GetMapping("/services")
    public List<?> listServices(@RequestHeader("X-Business-User-Id") Long businessUserId) {
        return businessServiceService.getMyServices(businessUserId);
    }

    @GetMapping("/services/stats")
    public List<?> listServiceStats(@RequestHeader("X-Business-User-Id") Long businessUserId) {
        return businessServiceService.getMyServiceStats(businessUserId);
    }

    @GetMapping("/services/{serviceId}")
    public Object getService(
            @RequestHeader("X-Business-User-Id") Long businessUserId,
            @PathVariable Long serviceId
    ) {
        return businessServiceService.getMyService(businessUserId, serviceId);
    }

    @PutMapping("/services/{serviceId}")
    public Map<String, Object> updateService(
            @RequestHeader("X-Business-User-Id") Long businessUserId,
            @PathVariable Long serviceId,
            @Valid @RequestBody UpdateServiceRequest req
    ) {
        Long id = businessServiceService.updateService(businessUserId, serviceId, req);
        return Map.of("id", id);
    }

    @PostMapping(path = "/services/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> uploadListingImage(
            @RequestHeader("X-Business-User-Id") Long businessUserId,
            @RequestPart("file") MultipartFile file
    ) {
        String imageUrl = businessServiceService.uploadListingImage(businessUserId, file);
        return Map.of("imageUrl", imageUrl);
    }

    @GetMapping("/bookings")
    public List<?> getBookings(@RequestHeader("X-Business-User-Id") Long businessUserId) {
        return businessServiceService.getBookings(businessUserId);
    }

    @PatchMapping("/bookings/{bookingId}")
    public Object updateBookingStatus(
            @RequestHeader("X-Business-User-Id") Long businessUserId,
            @PathVariable Long bookingId,
            @Valid @RequestBody UpdateBusinessBookingRequest request
    ) {
        return businessServiceService.updateBookingStatus(businessUserId, bookingId, request);
    }

}
