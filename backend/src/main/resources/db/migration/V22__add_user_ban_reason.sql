ALTER TABLE users
    ADD COLUMN ban_reason TEXT NULL AFTER is_active,
    ADD COLUMN banned_by_user_id BIGINT NULL AFTER ban_reason,
    ADD COLUMN banned_at DATETIME NULL AFTER banned_by_user_id,
    ADD KEY idx_users_banned_by (banned_by_user_id),
    ADD CONSTRAINT fk_users_banned_by FOREIGN KEY (banned_by_user_id) REFERENCES users(id);
