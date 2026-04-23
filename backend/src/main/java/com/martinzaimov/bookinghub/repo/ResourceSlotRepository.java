package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.ResourceSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ResourceSlotRepository extends JpaRepository<ResourceSlot, Long> {

    List<ResourceSlot> findByServiceIdAndResourceIdAndStartAtBetween(
            Long serviceId,
            Long resourceId,
            LocalDateTime from,
            LocalDateTime to
    );

    List<ResourceSlot> findByServiceIdAndStatusOrderByStartAtAsc(Long serviceId, ResourceSlot.Status status);

    Optional<ResourceSlot> findByIdAndServiceId(Long id, Long serviceId);
}
