SET @users_last_login_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'last_login_at'
);

SET @add_users_last_login_column_sql = IF(
  @users_last_login_column_exists = 0,
  'ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL AFTER updated_at',
  'SELECT 1'
);

PREPARE add_users_last_login_column_stmt FROM @add_users_last_login_column_sql;
EXECUTE add_users_last_login_column_stmt;
DEALLOCATE PREPARE add_users_last_login_column_stmt;
