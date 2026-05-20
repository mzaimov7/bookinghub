package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.CommentDTO;
import com.martinzaimov.bookinghub.dto.CreateCommentRequest;
import com.martinzaimov.bookinghub.entity.ClientProfile;
import com.martinzaimov.bookinghub.entity.Comment;
import com.martinzaimov.bookinghub.entity.User;
import com.martinzaimov.bookinghub.repo.ClientProfileRepository;
import com.martinzaimov.bookinghub.repo.CommentRepository;
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
    private final UserRepository users;
    private final ClientProfileRepository clientProfiles;

    public CommentService(
            CommentRepository comments,
            ServiceRepository services,
            UserRepository users,
            ClientProfileRepository clientProfiles
    ) {
        this.comments = comments;
        this.services = services;
        this.users = users;
        this.clientProfiles = clientProfiles;
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
        if (user.getRole() != User.Role.CLIENT) {
            throw new ResponseStatusException(BAD_REQUEST, "Само клиентски профили могат да публикуват коментари");
        }

        services.findByIdAndActiveTrueAndApprovalStatus(serviceId, com.martinzaimov.bookinghub.entity.Service.ApprovalStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Услугата не е намерена"));

        String text = normalize(request.text);
        if (text == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Коментарът не може да е празен");
        }

        Comment comment = new Comment();
        comment.setServiceId(serviceId);
        comment.setAuthorUserId(userId);
        comment.setParentId(null);
        comment.setText(text);
        comment.setStatus(Comment.Status.VISIBLE);

        return toDto(comments.save(comment));
    }

    private CommentDTO toDto(Comment comment) {
        User user = users.findById(comment.getAuthorUserId()).orElse(null);
        ClientProfile profile = clientProfiles.findById(comment.getAuthorUserId()).orElse(null);

        String authorName = "Потребител";
        if (profile != null) {
            authorName = (safe(profile.getFirstName()) + " " + safe(profile.getLastName())).trim();
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
