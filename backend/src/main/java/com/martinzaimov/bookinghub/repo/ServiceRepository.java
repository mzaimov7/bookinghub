package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    Optional<Service> findByIdAndActiveTrue(Long id);

    @Query("""
        select s
        from Service s
        where s.active = true
          and (:categoryId is null or s.category.id = :categoryId)
          and (:city is null or lower(s.city) = lower(:city))
          and (:minPrice is null or s.price >= :minPrice)
          and (:maxPrice is null or s.price <= :maxPrice)
          and (
              :q is null
              or lower(s.title) like lower(concat('%', :q, '%'))
              or lower(s.description) like lower(concat('%', :q, '%'))
          )
        order by s.title asc
    """)
    List<Service> search(
            @Param("q") String q,
            @Param("categoryId") Long categoryId,
            @Param("city") String city,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice
    );
}
