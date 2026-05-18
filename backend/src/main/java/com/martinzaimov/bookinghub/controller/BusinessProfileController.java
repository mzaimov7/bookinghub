package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.ChangePasswordRequest;
import com.martinzaimov.bookinghub.dto.UpdateBusinessProfileRequest;
import com.martinzaimov.bookinghub.dto.VerifyPasswordRequest;
import com.martinzaimov.bookinghub.service.BusinessProfileService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/business")
public class BusinessProfileController {

    private final BusinessProfileService businessProfileService;

    public BusinessProfileController(BusinessProfileService businessProfileService) {
        this.businessProfileService = businessProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(businessProfileService.getProfile(userId));
    }

    @PostMapping(path = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePhoto(
            @RequestHeader("X-User-Id") Long userId,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(businessProfileService.uploadProfilePhoto(userId, file));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateBusinessProfileRequest request
    ) {
        return ResponseEntity.ok(businessProfileService.updateProfile(userId, request));
    }

    @PostMapping("/profile/verify-password")
    public ResponseEntity<?> verifyPassword(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody VerifyPasswordRequest request
    ) {
        businessProfileService.verifyProfilePassword(userId, request.password);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        businessProfileService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }
}
