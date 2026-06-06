CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_password_reset_token_hash (token_hash),
    KEY idx_password_reset_tokens_user (user_id),
    KEY idx_password_reset_tokens_expires (expires_at),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE service_user_restrictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_user_id BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_service_user_restriction (service_id, user_id),
    KEY idx_service_user_restrictions_user (user_id),
    KEY idx_service_user_restrictions_service (service_id),
    CONSTRAINT fk_service_user_restrictions_service FOREIGN KEY (service_id) REFERENCES services(id),
    CONSTRAINT fk_service_user_restrictions_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_service_user_restrictions_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE user_action_limits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action_type VARCHAR(40) NOT NULL,
    window_start DATETIME NOT NULL,
    action_count INT NOT NULL DEFAULT 0,
    blocked_until DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_action_limit (user_id, action_type),
    KEY idx_user_action_limits_blocked_until (blocked_until),
    CONSTRAINT fk_user_action_limits_user FOREIGN KEY (user_id) REFERENCES users(id)
);
