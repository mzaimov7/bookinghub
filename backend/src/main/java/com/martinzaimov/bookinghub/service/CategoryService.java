package com.martinzaimov.bookinghub.service;

import com.martinzaimov.bookinghub.dto.CategoryOTD;
import com.martinzaimov.bookinghub.repo.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }

    public List<CategoryOTD> getActive() {
        return repo.findAllByActiveTrueOrderByNameAsc()
                .stream()
                .map(c -> new CategoryOTD(c.getId(), c.getName(), c.getDescription()))
                .toList();
    }
}
