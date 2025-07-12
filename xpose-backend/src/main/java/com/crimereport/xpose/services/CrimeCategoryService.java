package com.crimereport.xpose.services;

import com.crimereport.xpose.models.CrimeCategory;
import com.crimereport.xpose.repository.CrimeCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrimeCategoryService {

    @Autowired
    private CrimeCategoryRepository categoryRepository;

    public CrimeCategory addCategory(CrimeCategory category) {
        String normalizedName = category.getName().trim().toLowerCase();

        boolean exists = categoryRepository.findAll().stream()
                .anyMatch(existing -> existing.getName().trim().equalsIgnoreCase(normalizedName));

        if (exists) {
            throw new IllegalArgumentException("Category with this name already exists (case-insensitive)");
        }

        category.setName(capitalizeWords(category.getName().trim()));
        return categoryRepository.save(category);
    }

    private String capitalizeWords(String input) {
        String[] words = input.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1).toLowerCase())
                        .append(" ");
            }
        }
        return sb.toString().trim();
    }


    public List<CrimeCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
}
