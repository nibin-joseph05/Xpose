package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.CrimeCategory;
import com.crimereport.xpose.services.CrimeCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crime-categories")
@CrossOrigin(origins = "*")
public class CrimeCategoryController {

    @Autowired
    private CrimeCategoryService categoryService;

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody CrimeCategory category) {
        try {
            CrimeCategory saved = categoryService.addCategory(category);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CrimeCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
