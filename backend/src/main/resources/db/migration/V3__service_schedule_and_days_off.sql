ALTER TABLE services
  ADD COLUMN opens_at TIME NULL AFTER duration_minutes,
  ADD COLUMN closes_at TIME NULL AFTER opens_at,
  ADD COLUMN slot_interval_minutes INT NOT NULL DEFAULT 30 AFTER closes_at,
  ADD COLUMN booking_horizon_days INT NOT NULL DEFAULT 90 AFTER slot_interval_minutes;

CREATE TABLE resource_weekly_off_days (
  id BIGINT NOT NULL AUTO_INCREMENT,
  resource_id BIGINT NOT NULL,
  day_of_week TINYINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_resource_weekly_off_day (resource_id, day_of_week),
  KEY idx_resource_weekly_off_resource (resource_id),
  CONSTRAINT fk_resource_weekly_off_resource
    FOREIGN KEY (resource_id) REFERENCES resources(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resource_day_offs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  resource_id BIGINT NOT NULL,
  off_date DATE NOT NULL,
  note VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_resource_day_off (resource_id, off_date),
  KEY idx_resource_day_off_resource (resource_id),
  KEY idx_resource_day_off_date (off_date),
  CONSTRAINT fk_resource_day_off_resource
    FOREIGN KEY (resource_id) REFERENCES resources(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
