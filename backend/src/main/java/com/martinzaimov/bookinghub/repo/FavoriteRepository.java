package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Favorite;
import com.martinzaimov.bookinghub.entity.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    List<Favorite> findByIdUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByIdUserIdAndIdServiceId(Long userId, Long serviceId);
    void deleteByIdUserIdAndIdServiceId(Long userId, Long serviceId);
}
