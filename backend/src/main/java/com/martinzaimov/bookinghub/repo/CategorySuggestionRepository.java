package com.martinzaimov.bookinghub.repo;

import com.martinzaimov.bookinghub.entity.CategorySuggestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategorySuggestionRepository extends JpaRepository<CategorySuggestion, Long> {
    List<CategorySuggestion> findAllByOrderByIdDesc();
}
