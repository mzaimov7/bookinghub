package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.CreateResourceRequest;
import com.martinzaimov.bookinghub.dto.ResourceOTD;
import com.martinzaimov.bookinghub.dto.UpdateResourceRequest;
import com.martinzaimov.bookinghub.service.BusinessResourceService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/business/resources")
public class BusinessResourceController {

    private final BusinessResourceService service;

    public BusinessResourceController(BusinessResourceService service) {
        this.service = service;
    }

    @GetMapping
    public List<ResourceOTD> list(@RequestHeader("X-Business-User-Id") Long businessUserId) {
        return service.list(businessUserId);
    }

    @PostMapping
    public Map<String, Object> create(
            @RequestHeader("X-Business-User-Id") Long businessUserId,
            @Valid @RequestBody CreateResourceRequest req
    ) {
        Long id = service.create(businessUserId, req);
        return Map.of("id", id);
    }

    @PatchMapping("/{id}")
    public Map<String, Object> update(
            @RequestHeader("X-Business-User-Id") Long businessUserId,
            @PathVariable Long id,
            @RequestBody UpdateResourceRequest req
    ) {
        service.update(businessUserId, id, req);
        return Map.of("ok", true);
    }

    @PostMapping(path = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> uploadPhoto(
            @RequestHeader("X-Business-User-Id") Long businessUserId,
            @RequestPart("file") MultipartFile file
    ) {
        String photoUrl = service.uploadPhoto(businessUserId, file);
        return Map.of("photoUrl", photoUrl);
    }
}
