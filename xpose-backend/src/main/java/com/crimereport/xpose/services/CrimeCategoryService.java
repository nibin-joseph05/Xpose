package com.crimereport.xpose.services;

import com.crimereport.xpose.models.CrimeCategory;
import com.crimereport.xpose.repository.CrimeCategoryRepository;
import com.crimereport.xpose.repository.CrimeTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CrimeCategoryService {

    @Autowired
    private CrimeCategoryRepository categoryRepository;

    @Autowired
    private CrimeTypeRepository crimeTypeRepository;

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

    public CrimeCategory updateCategory(Long id, CrimeCategory updatedCategory) {
        return categoryRepository.findById(id).map(existing -> {
            String normalizedName = updatedCategory.getName().trim().toLowerCase();
            boolean nameExists = categoryRepository.findAll().stream()
                    .anyMatch(cat -> !cat.getId().equals(id) &&
                            cat.getName().trim().equalsIgnoreCase(normalizedName));

            if (nameExists) {
                throw new IllegalArgumentException("Another category with this name already exists.");
            }

            existing.setName(capitalizeWords(updatedCategory.getName().trim()));
            existing.setDescription(updatedCategory.getDescription() != null ? updatedCategory.getDescription().trim() : null);
            return categoryRepository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
    }

    public void deleteCategory(Long id) {
        CrimeCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        boolean isUsed = crimeTypeRepository.existsByCategory(category);
        if (isUsed) {
            throw new IllegalStateException("Cannot delete category: it is assigned to one or more crime types.");
        }

        categoryRepository.delete(category);
    }

    public Optional<CrimeCategory> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

}
