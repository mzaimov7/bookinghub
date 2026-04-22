package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.ServiceImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceImageRepository extends JpaRepository<ServiceImage, Long> {

    List<ServiceImage> findByServiceIdOrderBySortOrderAsc(Long serviceId);

    // ✅ взима cover снимката (ако има)
    Optional<ServiceImage> findFirstByServiceIdAndCoverTrueOrderBySortOrderAsc(Long serviceId);
}