package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.BusinessProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessProfileRepository extends JpaRepository<BusinessProfile, Long> {
}