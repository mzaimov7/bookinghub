package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.RecentSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface RecentSearchRepository extends JpaRepository<RecentSearch, Long> {
    List<RecentSearch> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<RecentSearch> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query(value = """
            DELETE FROM recent_searches
            WHERE user_id = :userId
              AND query_text <=> :queryText
              AND city <=> :city
              AND category_id <=> :categoryId
              AND min_price <=> :minPrice
              AND max_price <=> :maxPrice
            """, nativeQuery = true)
    void deleteDuplicateSearch(
            @Param("userId") Long userId,
            @Param("queryText") String queryText,
            @Param("city") String city,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );
}
