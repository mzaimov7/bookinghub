ALTER TABLE services
  ADD COLUMN admin_deletion_reason TEXT NULL AFTER is_active,
  ADD COLUMN admin_deleted_by_user_id BIGINT NULL AFTER admin_deletion_reason,
  ADD COLUMN admin_deleted_at DATETIME NULL AFTER admin_deleted_by_user_id,
  ADD KEY idx_services_admin_deleted_at (admin_deleted_at),
  ADD CONSTRAINT fk_services_admin_deleted_by
    FOREIGN KEY (admin_deleted_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
