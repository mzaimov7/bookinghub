SET @category_suggestion_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'services'
    AND column_name = 'category_suggestion'
);

SET @category_suggestion_sql = IF(
  @category_suggestion_column_exists = 0,
  'ALTER TABLE services ADD COLUMN category_suggestion TEXT NULL AFTER category_id',
  'SELECT 1'
);

PREPARE category_suggestion_stmt FROM @category_suggestion_sql;
EXECUTE category_suggestion_stmt;
DEALLOCATE PREPARE category_suggestion_stmt;
