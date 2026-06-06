package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.ServiceUserRestriction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceUserRestrictionRepository extends JpaRepository<ServiceUserRestriction, Long> {
    List<ServiceUserRestriction> findAllByOrderByCreatedAtDesc();
    Optional<ServiceUserRestriction> findByServiceIdAndUserIdAndActiveTrue(Long serviceId, Long userId);
    Optional<ServiceUserRestriction> findByServiceIdAndUserId(Long serviceId, Long userId);
}
