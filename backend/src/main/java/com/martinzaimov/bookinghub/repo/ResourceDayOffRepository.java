package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.ResourceDayOff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ResourceDayOffRepository extends JpaRepository<ResourceDayOff, Long> {
    List<ResourceDayOff> findByResourceIdAndOffDateBetween(Long resourceId, LocalDate from, LocalDate to);
    List<ResourceDayOff> findByResourceIdOrderByOffDateAsc(Long resourceId);
}
