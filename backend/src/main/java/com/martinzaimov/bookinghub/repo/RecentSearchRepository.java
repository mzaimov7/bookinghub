package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.RecentSearch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecentSearchRepository extends JpaRepository<RecentSearch, Long> {
    List<RecentSearch> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<RecentSearch> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
