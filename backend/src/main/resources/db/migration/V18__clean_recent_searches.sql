DELETE rs
FROM recent_searches rs
JOIN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY
          user_id,
          COALESCE(query_text, ''),
          COALESCE(city, ''),
          COALESCE(category_id, -1),
          COALESCE(min_price, -1),
          COALESCE(max_price, -1)
        ORDER BY created_at DESC, id DESC
      ) AS duplicate_rank
    FROM recent_searches
  ) ranked
  WHERE duplicate_rank > 1
) duplicates ON duplicates.id = rs.id;

DELETE rs
FROM recent_searches rs
JOIN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id
        ORDER BY created_at DESC, id DESC
      ) AS user_rank
    FROM recent_searches
  ) ranked
  WHERE user_rank > 10
) old_searches ON old_searches.id = rs.id;
