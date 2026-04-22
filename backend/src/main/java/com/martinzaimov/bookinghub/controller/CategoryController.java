package com.martinzaimov.bookinghub.controller;

import com.martinzaimov.bookinghub.dto.CategoryOTD;
import com.martinzaimov.bookinghub.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryOTD> list() {
        return categoryService.getActive();
    }
}