package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.ServiceOTD;
import com.martinzaimov.bookinghub.dto.CreateCommentRequest;
import com.martinzaimov.bookinghub.dto.UpdateCommentRequest;
import com.martinzaimov.bookinghub.service.CommentService;
import com.martinzaimov.bookinghub.service.ClientProfileService;
import com.martinzaimov.bookinghub.service.ReviewService;
import com.martinzaimov.bookinghub.service.ServiceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;
    private final ClientProfileService clientProfileService;
    private final CommentService commentService;
    private final ReviewService reviewService;

    public ServiceController(ServiceService serviceService, ClientProfileService clientProfileService, CommentService commentService, ReviewService reviewService) {
        this.serviceService = serviceService;
        this.clientProfileService = clientProfileService;
        this.commentService = commentService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<ServiceOTD> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort
    ) {
        return serviceService.search(query, categoryId, city, minPrice, maxPrice, sort);
    }

    @GetMapping("/{id}")
    public ServiceOTD get(@PathVariable Long id) {
        return serviceService.getById(id);
    }

    @GetMapping("/{id}/slots")
    public List<?> getAvailableSlots(@PathVariable Long id) {
        return clientProfileService.getAvailableSlots(id);
    }

    @GetMapping("/{id}/comments")
    public List<?> getComments(@PathVariable Long id) {
        return commentService.getVisibleComments(id);
    }

    @GetMapping("/{id}/reviews")
    public List<?> getReviews(@PathVariable Long id) {
        return reviewService.getVisibleReviewsForService(id);
    }

    @PostMapping("/{id}/comments")
    public Object createComment(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        return commentService.createComment(userId, id, request);
    }

    @PatchMapping("/{id}/comments/{commentId}")
    public Object updateComment(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequest request
    ) {
        return commentService.updateOwnComment(userId, id, commentId, request);
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public void deleteComment(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @PathVariable Long commentId
    ) {
        commentService.deleteOwnComment(userId, id, commentId);
    }
}
