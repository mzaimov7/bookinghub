ALTER TABLE services
  ADD COLUMN business_deleted_at DATETIME NULL,
  ADD KEY idx_services_business_deleted_at (business_deleted_at);
