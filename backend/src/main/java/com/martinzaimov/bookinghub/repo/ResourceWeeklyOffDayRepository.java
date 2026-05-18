package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.ResourceWeeklyOffDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceWeeklyOffDayRepository extends JpaRepository<ResourceWeeklyOffDay, Long> {
    List<ResourceWeeklyOffDay> findByResourceId(Long resourceId);
}
