package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.entity.UserActionLimit;
import com.martinzaimov.bookinghub.repo.UserActionLimitRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static org.springframework.http.HttpStatus.TOO_MANY_REQUESTS;

@Service
public class ActionLimitService {

    public static final String BOOKING_CREATE = "BOOKING_CREATE";
    public static final String COMMENT_CREATE = "COMMENT_CREATE";
    public static final String LIMIT_MESSAGE = "Достигнахте лимита си на използване. С цел сигурност и ограничаване на спам можете да продължите след 5 часа.";

    private final UserActionLimitRepository limits;

    public ActionLimitService(UserActionLimitRepository limits) {
        this.limits = limits;
    }

    @Transactional
    public void checkAndRecord(Long userId, String actionType, int maxPerHour) {
        LocalDateTime now = LocalDateTime.now();
        UserActionLimit limit = limits.findByUserIdAndActionType(userId, actionType)
                .orElseGet(() -> createLimit(userId, actionType, now));

        if (limit.getBlockedUntil() != null && limit.getBlockedUntil().isAfter(now)) {
            throw new ResponseStatusException(TOO_MANY_REQUESTS, LIMIT_MESSAGE);
        }

        if (limit.getWindowStart() == null || limit.getWindowStart().plusHours(1).isBefore(now)) {
            limit.setWindowStart(now);
            limit.setActionCount(1);
            limit.setBlockedUntil(null);
            limits.save(limit);
            return;
        }

        if (limit.getActionCount() >= maxPerHour) {
            limit.setBlockedUntil(now.plusHours(5));
            limits.save(limit);
            throw new ResponseStatusException(TOO_MANY_REQUESTS, LIMIT_MESSAGE);
        }

        limit.setActionCount(limit.getActionCount() + 1);
        limits.save(limit);
    }

    private UserActionLimit createLimit(Long userId, String actionType, LocalDateTime now) {
        UserActionLimit limit = new UserActionLimit();
        limit.setUserId(userId);
        limit.setActionType(actionType);
        limit.setWindowStart(now);
        limit.setActionCount(0);
        return limit;
    }
}
