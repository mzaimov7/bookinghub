package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.CreateBookingRequest;
import com.martinzaimov.bookinghub.dto.ChangePasswordRequest;
import com.martinzaimov.bookinghub.dto.RecentSearchRequest;
import com.martinzaimov.bookinghub.dto.UpdateProfileRequest;
import com.martinzaimov.bookinghub.dto.VerifyPasswordRequest;
import com.martinzaimov.bookinghub.service.ClientProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/client")
public class ClientProfileController {

    private final ClientProfileService clientProfileService;

    public ClientProfileController(ClientProfileService clientProfileService) {
        this.clientProfileService = clientProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(clientProfileService.getProfile(userId));
    }

    @PostMapping(path = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePhoto(
            @RequestHeader("X-User-Id") Long userId,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(clientProfileService.uploadProfilePhoto(userId, file));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(clientProfileService.updateProfile(userId, request));
    }

    @PostMapping("/profile/verify-password")
    public ResponseEntity<?> verifyPassword(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody VerifyPasswordRequest request
    ) {
        clientProfileService.verifyProfilePassword(userId, request.password);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        clientProfileService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(clientProfileService.getFavorites(userId));
    }

    @GetMapping("/favorites/ids")
    public ResponseEntity<?> getFavoriteIds(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(clientProfileService.getFavoriteIds(userId));
    }

    @PostMapping("/favorites/{serviceId}")
    public ResponseEntity<?> addFavorite(@RequestHeader("X-User-Id") Long userId, @PathVariable Long serviceId) {
        clientProfileService.addFavorite(userId, serviceId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/favorites/{serviceId}")
    public ResponseEntity<?> removeFavorite(@RequestHeader("X-User-Id") Long userId, @PathVariable Long serviceId) {
        clientProfileService.removeFavorite(userId, serviceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recent-searches")
    public ResponseEntity<?> getRecentSearches(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(clientProfileService.getRecentSearches(userId));
    }

    @PostMapping("/recent-searches")
    public ResponseEntity<?> saveRecentSearch(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody RecentSearchRequest request
    ) {
        clientProfileService.saveRecentSearch(userId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(clientProfileService.getBookings(userId));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return ResponseEntity.ok(clientProfileService.createBooking(userId, request));
    }
}
