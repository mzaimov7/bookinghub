package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findAllByBusinessUserIdOrderByNameAsc(Long businessUserId);

    Optional<Resource> findByIdAndBusinessUserId(Long id, Long businessUserId);
}