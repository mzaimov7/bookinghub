SET @comments_parent_review_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'comments'
    AND column_name = 'parent_review_id'
);

SET @add_comments_parent_review_column_sql = IF(
  @comments_parent_review_column_exists = 0,
  'ALTER TABLE comments ADD COLUMN parent_review_id BIGINT NULL AFTER parent_id',
  'SELECT 1'
);

PREPARE add_comments_parent_review_column_stmt FROM @add_comments_parent_review_column_sql;
EXECUTE add_comments_parent_review_column_stmt;
DEALLOCATE PREPARE add_comments_parent_review_column_stmt;

SET @comments_parent_review_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'comments'
    AND index_name = 'idx_comments_parent_review'
);

SET @add_comments_parent_review_index_sql = IF(
  @comments_parent_review_index_exists = 0,
  'ALTER TABLE comments ADD INDEX idx_comments_parent_review (parent_review_id)',
  'SELECT 1'
);

PREPARE add_comments_parent_review_index_stmt FROM @add_comments_parent_review_index_sql;
EXECUTE add_comments_parent_review_index_stmt;
DEALLOCATE PREPARE add_comments_parent_review_index_stmt;

SET @comments_parent_review_fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'comments'
    AND constraint_name = 'fk_comments_parent_review'
);

SET @add_comments_parent_review_fk_sql = IF(
  @comments_parent_review_fk_exists = 0,
  'ALTER TABLE comments ADD CONSTRAINT fk_comments_parent_review FOREIGN KEY (parent_review_id) REFERENCES reviews(id) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);

PREPARE add_comments_parent_review_fk_stmt FROM @add_comments_parent_review_fk_sql;
EXECUTE add_comments_parent_review_fk_stmt;
DEALLOCATE PREPARE add_comments_parent_review_fk_stmt;
