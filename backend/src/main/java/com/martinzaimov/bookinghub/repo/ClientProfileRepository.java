package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.ClientProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientProfileRepository extends JpaRepository<ClientProfile, Long> {
}