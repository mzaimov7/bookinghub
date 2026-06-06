package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllByServiceIdAndStatusOrderByCreatedAtDesc(Long serviceId, Comment.Status status);
    List<Comment> findAllByServiceIdInAndStatus(List<Long> serviceIds, Comment.Status status);
    List<Comment> findAllByOrderByCreatedAtDesc();
}
