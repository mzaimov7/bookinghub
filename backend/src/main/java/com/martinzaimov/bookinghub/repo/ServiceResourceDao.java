package com.martinzaimov.bookinghub.repo;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public class ServiceResourceDao {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public void link(Long serviceId, Long resourceId) {
        em.createNativeQuery("insert into service_resources(service_id, resource_id) values (?, ?)")
                .setParameter(1, serviceId)
                .setParameter(2, resourceId)
                .executeUpdate();
    }

    @Transactional
    public void unlinkAll(Long serviceId) {
        em.createNativeQuery("delete from service_resources where service_id = ?")
                .setParameter(1, serviceId)
                .executeUpdate();
    }

    @Transactional(readOnly = true)
    public List<Long> findResourceIdsByServiceId(Long serviceId) {
        return em.createNativeQuery("select resource_id from service_resources where service_id = ? order by resource_id")
                .setParameter(1, serviceId)
                .getResultList()
                .stream()
                .map(value -> ((Number) value).longValue())
                .toList();
    }
}
