package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    Optional<Service> findByIdAndActiveTrue(Long id);
    Optional<Service> findByIdAndActiveTrueAndApprovalStatus(Long id, Service.ApprovalStatus approvalStatus);
    List<Service> findAllByBusinessUserIdOrderByIdDesc(Long businessUserId);
    List<Service> findAllByBusinessUserIdAndActiveTrueOrderByIdDesc(Long businessUserId);
    List<Service> findAllByActiveTrueOrderByIdDesc();
    List<Service> findAllByOrderByIdDesc();
    List<Service> findAllByApprovalStatusOrderByIdDesc(Service.ApprovalStatus approvalStatus);

    @Query("""
        select s
        from Service s
        where s.active = true
          and s.approvalStatus = com.martinzaimov.bookinghub.entity.Service.ApprovalStatus.APPROVED
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

    @Query("""
        select s
        from Service s
        left join Booking b
          on b.serviceId = s.id
         and b.status in (
              com.martinzaimov.bookinghub.entity.Booking.Status.PENDING,
              com.martinzaimov.bookinghub.entity.Booking.Status.CONFIRMED,
              com.martinzaimov.bookinghub.entity.Booking.Status.COMPLETED
         )
        where s.active = true
          and s.approvalStatus = com.martinzaimov.bookinghub.entity.Service.ApprovalStatus.APPROVED
          and (:categoryId is null or s.category.id = :categoryId)
          and (:city is null or lower(s.city) = lower(:city))
          and (:minPrice is null or s.price >= :minPrice)
          and (:maxPrice is null or s.price <= :maxPrice)
          and (
              :q is null
              or lower(s.title) like lower(concat('%', :q, '%'))
              or lower(s.description) like lower(concat('%', :q, '%'))
          )
        group by s
        order by count(b.id) desc, s.title asc
    """)
    List<Service> searchPopular(
            @Param("q") String q,
            @Param("categoryId") Long categoryId,
            @Param("city") String city,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice
    );
}
