SET @business_profile_category_fk = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.referential_constraints
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'business_profiles'
      AND REFERENCED_TABLE_NAME = 'categories'
    LIMIT 1
);

SET @drop_business_profile_category_fk_sql = IF(
    @business_profile_category_fk IS NOT NULL,
    CONCAT('ALTER TABLE business_profiles DROP FOREIGN KEY ', @business_profile_category_fk),
    'SELECT 1'
);

PREPARE drop_business_profile_category_fk_stmt FROM @drop_business_profile_category_fk_sql;
EXECUTE drop_business_profile_category_fk_stmt;
DEALLOCATE PREPARE drop_business_profile_category_fk_stmt;

SET @business_profile_category_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'business_profiles'
      AND column_name = 'category_id'
);

SET @drop_business_profile_category_column_sql = IF(
    @business_profile_category_column_exists > 0,
    'ALTER TABLE business_profiles DROP COLUMN category_id',
    'SELECT 1'
);

PREPARE drop_business_profile_category_column_stmt FROM @drop_business_profile_category_column_sql;
EXECUTE drop_business_profile_category_column_stmt;
DEALLOCATE PREPARE drop_business_profile_category_column_stmt;

SET @recent_search_sort_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'recent_searches'
      AND column_name = 'sort'
);

SET @drop_recent_search_sort_column_sql = IF(
    @recent_search_sort_column_exists > 0,
    'ALTER TABLE recent_searches DROP COLUMN sort',
    'SELECT 1'
);

PREPARE drop_recent_search_sort_column_stmt FROM @drop_recent_search_sort_column_sql;
EXECUTE drop_recent_search_sort_column_stmt;
DEALLOCATE PREPARE drop_recent_search_sort_column_stmt;

SET @booking_source_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'bookings'
      AND column_name = 'source'
);

SET @drop_booking_source_column_sql = IF(
    @booking_source_column_exists > 0,
    'ALTER TABLE bookings DROP COLUMN source',
    'SELECT 1'
);

PREPARE drop_booking_source_column_stmt FROM @drop_booking_source_column_sql;
EXECUTE drop_booking_source_column_stmt;
DEALLOCATE PREPARE drop_booking_source_column_stmt;
