-- V1__init.sql
-- MySQL 8.x, InnoDB, utf8mb4

-- NOTE: Flyway по принцип изпълнява миграциите в избрания schema (bookinghub),
-- така че тук НЕ правим CREATE DATABASE.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =========================
-- 1) USERS
-- =========================
CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('CLIENT','BUSINESS','ADMIN') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_username (username),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 2) CLIENT PROFILES (1:1)
-- =========================
CREATE TABLE client_profiles (
  user_id BIGINT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_client_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 3) BUSINESS PROFILES (1:1)
-- =========================
CREATE TABLE business_profiles (
  user_id BIGINT NOT NULL,
  provider_type ENUM('COMPANY','INDIVIDUAL') NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  city VARCHAR(120) NOT NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  KEY idx_business_city (city),
  CONSTRAINT fk_business_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 4) CATEGORIES
-- =========================
CREATE TABLE categories (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_name (name),
  KEY idx_categories_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 5) SERVICES
-- =========================
CREATE TABLE services (
  id BIGINT NOT NULL AUTO_INCREMENT,
  business_user_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  city VARCHAR(120) NOT NULL,
  address VARCHAR(255) NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_services_business (business_user_id),
  KEY idx_services_category (category_id),
  KEY idx_services_city (city),
  KEY idx_services_active (is_active),
  KEY idx_services_city_category (city, category_id),
  KEY idx_services_price (price),
  CONSTRAINT fk_services_business
    FOREIGN KEY (business_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_services_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 6) SERVICE IMAGES
-- =========================
CREATE TABLE service_images (
  id BIGINT NOT NULL AUTO_INCREMENT,
  service_id BIGINT NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_service_images_service (service_id),
  KEY idx_service_images_cover (service_id, is_cover),
  CONSTRAINT fk_service_images_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 7) RESOURCES
-- =========================
CREATE TABLE resources (
  id BIGINT NOT NULL AUTO_INCREMENT,
  business_user_id BIGINT NOT NULL,
  type ENUM('STAFF','TEAM') NOT NULL,
  name VARCHAR(120) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_resources_business (business_user_id),
  KEY idx_resources_active (is_active),
  CONSTRAINT fk_resources_business
    FOREIGN KEY (business_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 8) SERVICE_RESOURCES (N:N)
-- =========================
CREATE TABLE service_resources (
  service_id BIGINT NOT NULL,
  resource_id BIGINT NOT NULL,
  PRIMARY KEY (service_id, resource_id),
  KEY idx_service_resources_resource (resource_id),
  CONSTRAINT fk_service_resources_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_service_resources_resource
    FOREIGN KEY (resource_id) REFERENCES resources(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 9) RESOURCE SLOTS
-- =========================
CREATE TABLE resource_slots (
  id BIGINT NOT NULL AUTO_INCREMENT,
  resource_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  status ENUM('AVAILABLE','HELD','BOOKED') NOT NULL DEFAULT 'AVAILABLE',
  hold_expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_slots_resource_time (resource_id, start_at, end_at),
  KEY idx_slots_service (service_id),
  KEY idx_slots_status (status),
  KEY idx_slots_start (start_at),
  CONSTRAINT fk_slots_resource
    FOREIGN KEY (resource_id) REFERENCES resources(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_slots_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 10) BOOKINGS
-- =========================
CREATE TABLE bookings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  slot_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  client_user_id BIGINT NOT NULL,
  status ENUM('PENDING','CONFIRMED','REJECTED','CANCELED') NOT NULL DEFAULT 'PENDING',
  status_reason TEXT NULL,
  client_note TEXT NULL,
  source ENUM('ONLINE','WALK_IN') NOT NULL DEFAULT 'ONLINE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_bookings_slot (slot_id),
  KEY idx_bookings_client (client_user_id),
  KEY idx_bookings_service (service_id),
  KEY idx_bookings_status (status),
  KEY idx_bookings_created (created_at),
  CONSTRAINT fk_bookings_slot
    FOREIGN KEY (slot_id) REFERENCES resource_slots(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_client
    FOREIGN KEY (client_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 11) REVIEWS
-- =========================
CREATE TABLE reviews (
  id BIGINT NOT NULL AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  status ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_reviews_booking (booking_id),
  KEY idx_reviews_service (service_id),
  KEY idx_reviews_author (author_user_id),
  KEY idx_reviews_status (status),
  KEY idx_reviews_rating (rating),
  CONSTRAINT fk_reviews_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_author
    FOREIGN KEY (author_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 12) COMMENTS (public under service)
-- =========================
CREATE TABLE comments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  service_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  text TEXT NOT NULL,
  status ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_service (service_id),
  KEY idx_comments_author (author_user_id),
  KEY idx_comments_parent (parent_id),
  KEY idx_comments_status (status),
  CONSTRAINT fk_comments_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_comments_author
    FOREIGN KEY (author_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_comments_parent
    FOREIGN KEY (parent_id) REFERENCES comments(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 13) REPORTS (polymorphic target)
-- =========================
CREATE TABLE reports (
  id BIGINT NOT NULL AUTO_INCREMENT,
  reporter_user_id BIGINT NOT NULL,
  target_type ENUM('SERVICE','USER','REVIEW','COMMENT') NOT NULL,
  target_id BIGINT NOT NULL,
  reason_text TEXT NOT NULL,
  status ENUM('OPEN','IN_REVIEW','RESOLVED','REJECTED') NOT NULL DEFAULT 'OPEN',
  resolved_by_user_id BIGINT NULL,
  resolution_note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_reporter (reporter_user_id),
  KEY idx_reports_status (status),
  KEY idx_reports_target (target_type, target_id),
  KEY idx_reports_resolver (resolved_by_user_id),
  CONSTRAINT fk_reports_reporter
    FOREIGN KEY (reporter_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_reports_resolved_by
    FOREIGN KEY (resolved_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 14) FAVORITES (N:N users<->services)
-- =========================
CREATE TABLE favorites (
  user_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, service_id),
  KEY idx_favorites_service (service_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_favorites_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 15) RECENT SEARCHES
-- =========================
CREATE TABLE recent_searches (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  query_text VARCHAR(200) NULL,
  city VARCHAR(120) NULL,
  category_id BIGINT NULL,
  min_price DECIMAL(10,2) NULL,
  max_price DECIMAL(10,2) NULL,
  sort ENUM('NEWEST','PRICE_ASC','PRICE_DESC','RATING_DESC') NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_recent_searches_user_created (user_id, created_at),
  KEY idx_recent_searches_category (category_id),
  CONSTRAINT fk_recent_searches_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_recent_searches_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 16) CATEGORY SUGGESTIONS
-- =========================
CREATE TABLE category_suggestions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  suggested_by_user_id BIGINT NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  admin_note TEXT NULL,
  created_category_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cat_sugg_user (suggested_by_user_id),
  KEY idx_cat_sugg_status (status),
  KEY idx_cat_sugg_created_category (created_category_id),
  CONSTRAINT fk_cat_sugg_user
    FOREIGN KEY (suggested_by_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_cat_sugg_created_category
    FOREIGN KEY (created_category_id) REFERENCES categories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 17) EMAIL NOTIFICATIONS (log)
-- =========================
CREATE TABLE email_notifications (
  id BIGINT NOT NULL AUTO_INCREMENT,
  event_type ENUM('BOOKING_CREATED','BOOKING_CONFIRMED','BOOKING_REJECTED','BOOKING_CANCELED') NOT NULL,
  booking_id BIGINT NOT NULL,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  provider_message_id VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_email_booking (booking_id),
  KEY idx_email_status_created (status, created_at),
  CONSTRAINT fk_email_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
