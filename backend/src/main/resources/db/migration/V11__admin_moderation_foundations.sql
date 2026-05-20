SET @approval_status_missing = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'services'
      AND COLUMN_NAME = 'approval_status'
);
SET @approval_status_sql = IF(
    @approval_status_missing = 0,
    'ALTER TABLE services ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT ''APPROVED'' AFTER is_active',
    'SELECT 1'
);
PREPARE approval_status_stmt FROM @approval_status_sql;
EXECUTE approval_status_stmt;
DEALLOCATE PREPARE approval_status_stmt;

SET @approval_note_missing = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'services'
      AND COLUMN_NAME = 'approval_note'
);
SET @approval_note_sql = IF(
    @approval_note_missing = 0,
    'ALTER TABLE services ADD COLUMN approval_note TEXT NULL AFTER approval_status',
    'SELECT 1'
);
PREPARE approval_note_stmt FROM @approval_note_sql;
EXECUTE approval_note_stmt;
DEALLOCATE PREPARE approval_note_stmt;

SET @approval_reviewed_by_missing = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'services'
      AND COLUMN_NAME = 'approval_reviewed_by_user_id'
);
SET @approval_reviewed_by_sql = IF(
    @approval_reviewed_by_missing = 0,
    'ALTER TABLE services ADD COLUMN approval_reviewed_by_user_id BIGINT NULL AFTER approval_note',
    'SELECT 1'
);
PREPARE approval_reviewed_by_stmt FROM @approval_reviewed_by_sql;
EXECUTE approval_reviewed_by_stmt;
DEALLOCATE PREPARE approval_reviewed_by_stmt;

SET @approval_reviewed_at_missing = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'services'
      AND COLUMN_NAME = 'approval_reviewed_at'
);
SET @approval_reviewed_at_sql = IF(
    @approval_reviewed_at_missing = 0,
    'ALTER TABLE services ADD COLUMN approval_reviewed_at DATETIME NULL AFTER approval_reviewed_by_user_id',
    'SELECT 1'
);
PREPARE approval_reviewed_at_stmt FROM @approval_reviewed_at_sql;
EXECUTE approval_reviewed_at_stmt;
DEALLOCATE PREPARE approval_reviewed_at_stmt;

UPDATE services
SET approval_status = 'APPROVED'
WHERE is_active = 1;

UPDATE services
SET approval_status = 'REJECTED'
WHERE is_active = 0
  AND admin_deletion_reason IS NOT NULL;

SET @admin_moderation_reason_missing = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'comments'
      AND COLUMN_NAME = 'admin_moderation_reason'
);
SET @admin_moderation_reason_sql = IF(
    @admin_moderation_reason_missing = 0,
    'ALTER TABLE comments ADD COLUMN admin_moderation_reason TEXT NULL AFTER status',
    'SELECT 1'
);
PREPARE admin_moderation_reason_stmt FROM @admin_moderation_reason_sql;
EXECUTE admin_moderation_reason_stmt;
DEALLOCATE PREPARE admin_moderation_reason_stmt;

SET @admin_moderated_by_missing = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'comments'
      AND COLUMN_NAME = 'admin_moderated_by_user_id'
);
SET @admin_moderated_by_sql = IF(
    @admin_moderated_by_missing = 0,
    'ALTER TABLE comments ADD COLUMN admin_moderated_by_user_id BIGINT NULL AFTER admin_moderation_reason',
    'SELECT 1'
);
PREPARE admin_moderated_by_stmt FROM @admin_moderated_by_sql;
EXECUTE admin_moderated_by_stmt;
DEALLOCATE PREPARE admin_moderated_by_stmt;

SET @admin_moderated_at_missing = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'comments'
      AND COLUMN_NAME = 'admin_moderated_at'
);
SET @admin_moderated_at_sql = IF(
    @admin_moderated_at_missing = 0,
    'ALTER TABLE comments ADD COLUMN admin_moderated_at DATETIME NULL AFTER admin_moderated_by_user_id',
    'SELECT 1'
);
PREPARE admin_moderated_at_stmt FROM @admin_moderated_at_sql;
EXECUTE admin_moderated_at_stmt;
DEALLOCATE PREPARE admin_moderated_at_stmt;
