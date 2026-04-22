package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.Service;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ServiceSpecs {

    public static Specification<Service> isActiveTrue() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    public static Specification<Service> cityEquals(String city) {
        return (root, query, cb) -> cb.equal(cb.lower(root.get("city")), city.toLowerCase());
    }

    public static Specification<Service> categoryIdEquals(Long categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Service> priceGte(BigDecimal min) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), min);
    }

    public static Specification<Service> priceLte(BigDecimal max) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), max);
    }

    public static Specification<Service> titleOrDescriptionContains(String q) {
        return (root, query, cb) -> {
            String like = "%" + q.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("description")), like)
            );
        };
    }
}