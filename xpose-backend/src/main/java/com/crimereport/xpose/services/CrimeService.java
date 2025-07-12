package com.crimereport.xpose.services;

import com.crimereport.xpose.models.CrimeType;
import com.crimereport.xpose.models.CrimeCategory;
import com.crimereport.xpose.repository.CrimeTypeRepository;
import com.crimereport.xpose.repository.CrimeCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrimeService {

    @Autowired
    private CrimeTypeRepository crimeTypeRepository;

    @Autowired
    private CrimeCategoryRepository crimeCategoryRepository;

    public CrimeType addCrime(CrimeType crime) {
        String normalizedCrimeName = crime.getName().trim().toLowerCase();

        boolean exists = crimeTypeRepository.findAll().stream()
                .anyMatch(existing -> existing.getName().trim().equalsIgnoreCase(normalizedCrimeName));

        if (exists) {
            throw new IllegalArgumentException("Crime with this name already exists (case-insensitive)");
        }

        CrimeCategory category = crimeCategoryRepository.findById(crime.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        crime.setName(capitalizeWords(crime.getName().trim()));
        crime.setCategory(category);
        return crimeTypeRepository.save(crime);
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

    public List<CrimeType> getAllCrimes() {
        return crimeTypeRepository.findAll();
    }

}
