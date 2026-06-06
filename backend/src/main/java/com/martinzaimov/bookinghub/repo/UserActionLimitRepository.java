package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.UserActionLimit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserActionLimitRepository extends JpaRepository<UserActionLimit, Long> {
    Optional<UserActionLimit> findByUserIdAndActionType(Long userId, String actionType);
}
