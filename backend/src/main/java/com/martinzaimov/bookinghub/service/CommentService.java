package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.CommentDTO;
import com.martinzaimov.bookinghub.dto.CreateCommentRequest;
import com.martinzaimov.bookinghub.dto.UpdateCommentRequest;
import com.martinzaimov.bookinghub.entity.BusinessProfile;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.Comment;
import com.martinzaimov.bookinghub.entity.Review;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.BusinessProfileRepository;
import com.martinzaimov.bookinghub.repo.ClientProfileRepository;
import com.martinzaimov.bookinghub.repo.CommentRepository;
import com.martinzaimov.bookinghub.repo.ReviewRepository;
import com.martinzaimov.bookinghub.repo.ServiceRepository;
import com.martinzaimov.bookinghub.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@org.springframework.stereotype.Service
public class CommentService {

    private final CommentRepository comments;
    private final ServiceRepository services;
    private final ReviewRepository reviews;
    private final UserRepository users;
    private final ClientProfileRepository clientProfiles;
    private final BusinessProfileRepository businessProfiles;

    public CommentService(
            CommentRepository comments,
            ServiceRepository services,
            ReviewRepository reviews,
            UserRepository users,
            ClientProfileRepository clientProfiles,
            BusinessProfileRepository businessProfiles
    ) {
        this.comments = comments;
        this.services = services;
        this.reviews = reviews;
        this.users = users;
        this.clientProfiles = clientProfiles;
        this.businessProfiles = businessProfiles;
    }

    public List<CommentDTO> getVisibleComments(Long serviceId) {
        services.findByIdAndActiveTrueAndApprovalStatus(serviceId, com.martinzaimov.bookinghub.entity.Service.ApprovalStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Услугата не е намерена"));

        return comments.findAllByServiceIdAndStatusOrderByCreatedAtDesc(serviceId, Comment.Status.VISIBLE)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CommentDTO createComment(Long userId, Long serviceId, CreateCommentRequest request) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Потребителят не е намерен"));
        var service = services.findByIdAndActiveTrueAndApprovalStatus(serviceId, com.martinzaimov.bookinghub.entity.Service.ApprovalStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Услугата не е намерена"));

        String text = normalize(request.text);
        if (text == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Коментарът не може да е празен");
        }

        Comment parent = null;
        User parentAuthor = null;
        Review parentReview = null;
        if (request.parentId != null && request.parentReviewId != null) {
            throw new ResponseStatusException(BAD_REQUEST, "Избери само коментар или само отзив, към който да отговориш");
        }
        if (request.parentId != null) {
            parent = comments.findById(request.parentId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Коментарът, към който отговаряш, не е намерен"));
            if (!parent.getServiceId().equals(serviceId)) {
                throw new ResponseStatusException(BAD_REQUEST, "Невалиден отговор към коментар");
            }
            if (parent.getStatus() != Comment.Status.VISIBLE) {
                throw new ResponseStatusException(BAD_REQUEST, "Коментарът, към който отговаряш, не е видим");
            }
            parentAuthor = users.findById(parent.getAuthorUserId()).orElse(null);
        }
        if (request.parentReviewId != null) {
            parentReview = reviews.findById(request.parentReviewId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Отзивът, към който отговаряш, не е намерен"));
            if (!parentReview.getServiceId().equals(serviceId) || parentReview.getStatus() != Review.Status.VISIBLE) {
                throw new ResponseStatusException(BAD_REQUEST, "Невалиден отговор към отзив");
            }
        }

        if (user.getRole() == User.Role.CLIENT) {
            if (parentReview != null) {
                throw new ResponseStatusException(BAD_REQUEST, "Клиентските профили могат да публикуват основен коментар или да отговорят на бизнеса");
            }
            if (parent != null && (parentAuthor == null || parentAuthor.getRole() != User.Role.BUSINESS)) {
                throw new ResponseStatusException(BAD_REQUEST, "Клиентските профили могат да отговарят само на отговори от бизнеса");
            }
        } else if (user.getRole() == User.Role.BUSINESS) {
            if (!service.getBusinessUserId().equals(userId)) {
                throw new ResponseStatusException(BAD_REQUEST, "Можеш да отговаряш само на коментарите към своите обяви");
            }
            if (parent == null && parentReview == null) {
                throw new ResponseStatusException(BAD_REQUEST, "Избери коментар или отзив, на който да отговориш");
            }
        } else {
            throw new ResponseStatusException(BAD_REQUEST, "Само клиентски и бизнес профили могат да публикуват коментари");
        }

        Comment comment = new Comment();
        comment.setServiceId(serviceId);
        comment.setAuthorUserId(userId);
        comment.setParentId(parent == null ? null : parent.getId());
        comment.setParentReviewId(parentReview == null ? null : parentReview.getId());
        comment.setText(text);
        comment.setStatus(Comment.Status.VISIBLE);

        return toDto(comments.save(comment));
    }

    @Transactional
    public CommentDTO updateOwnComment(Long userId, Long serviceId, Long commentId, UpdateCommentRequest request) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Потребителят не е намерен"));
        if (user.getRole() != User.Role.CLIENT) {
            throw new ResponseStatusException(BAD_REQUEST, "Само клиентски профили могат да редактират своите коментари");
        }

        Comment comment = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Коментарът не е намерен"));
        if (!comment.getServiceId().equals(serviceId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Коментарът не принадлежи към тази обява");
        }
        if (!comment.getAuthorUserId().equals(userId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Можеш да редактираш само своите коментари");
        }

        String text = normalize(request.text);
        if (text == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Коментарът не може да е празен");
        }

        comment.setText(text);
        return toDto(comments.save(comment));
    }

    @Transactional
    public void deleteOwnComment(Long userId, Long serviceId, Long commentId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Потребителят не е намерен"));
        if (user.getRole() != User.Role.CLIENT && user.getRole() != User.Role.BUSINESS) {
            throw new ResponseStatusException(BAD_REQUEST, "Само клиентски и бизнес профили могат да изтриват своите коментари");
        }

        Comment comment = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Коментарът не е намерен"));
        if (!comment.getServiceId().equals(serviceId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Коментарът не принадлежи към тази обява");
        }
        if (!comment.getAuthorUserId().equals(userId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Можеш да изтриваш само своите коментари");
        }

        comment.setStatus(Comment.Status.HIDDEN);
        comments.save(comment);
    }

    private CommentDTO toDto(Comment comment) {
        User user = users.findById(comment.getAuthorUserId()).orElse(null);
        ClientProfile profile = clientProfiles.findById(comment.getAuthorUserId()).orElse(null);
        BusinessProfile businessProfile = businessProfiles.findById(comment.getAuthorUserId()).orElse(null);

        String authorName = "Потребител";
        String authorRole = user != null ? user.getRole().name() : "CLIENT";
        String authorPhotoUrl = null;
        if (profile != null) {
            authorName = (safe(profile.getFirstName()) + " " + safe(profile.getLastName())).trim();
            authorPhotoUrl = profile.getPhotoUrl();
        } else if (businessProfile != null) {
            authorName = safe(businessProfile.getBusinessName());
            authorPhotoUrl = businessProfile.getPhotoUrl();
        }
        if (authorName.isBlank() && user != null) {
            authorName = safe(user.getUsername());
        }
        if (authorName.isBlank()) {
            authorName = "Потребител";
        }

        return new CommentDTO(
                comment.getId(),
                comment.getServiceId(),
                comment.getAuthorUserId(),
                authorName,
                authorRole,
                authorPhotoUrl,
                comment.getParentId(),
                comment.getParentReviewId(),
                comment.getText(),
                comment.getCreatedAt()
        );
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
