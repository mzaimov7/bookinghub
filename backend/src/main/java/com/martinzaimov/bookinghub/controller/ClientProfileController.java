package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.CreateBookingRequest;
import com.martinzaimov.bookinghub.dto.RecentSearchRequest;
import com.martinzaimov.bookinghub.dto.UpdateProfileRequest;
import com.martinzaimov.bookinghub.service.ClientProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(clientProfileService.updateProfile(userId, request));
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
