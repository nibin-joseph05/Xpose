package com.crimereport.xpose.services;

import com.crimereport.xpose.dto.CrimeTypeDTO;
import com.crimereport.xpose.models.CrimeType;
import com.crimereport.xpose.models.CrimeCategory;
import com.crimereport.xpose.repository.CrimeTypeRepository;
import com.crimereport.xpose.repository.CrimeCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;
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

    public List<CrimeTypeDTO> getAllCrimeDTOs() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return crimeTypeRepository.findAll().stream().map(crime -> {
            CrimeTypeDTO dto = new CrimeTypeDTO();
            dto.setId(crime.getId());
            dto.setName(crime.getName());
            dto.setDescription(crime.getDescription());
            dto.setPriority(crime.getPriority().name());
            dto.setRequiresImmediateAttention(crime.isRequiresImmediateAttention());
            dto.setCreatedAt(crime.getCreatedAt() != null ? crime.getCreatedAt().format(formatter) : null);
            dto.setCategoryId(crime.getCategory().getId());
            dto.setCategoryName(crime.getCategory().getName());
            return dto;
        }).collect(Collectors.toList());
    }

    public CrimeType updateCrime(Long id, CrimeType updatedCrime) {
        CrimeType existing = crimeTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Crime not found"));

        String newName = updatedCrime.getName().trim().toLowerCase();
        if (!existing.getName().equalsIgnoreCase(newName)) {
            boolean exists = crimeTypeRepository.findAll().stream()
                    .anyMatch(c -> c.getName().trim().equalsIgnoreCase(newName));
            if (exists) {
                throw new IllegalArgumentException("Crime with this name already exists");
            }
            existing.setName(capitalizeWords(updatedCrime.getName().trim()));
        }

        existing.setDescription(updatedCrime.getDescription());
        existing.setPriority(updatedCrime.getPriority());
        existing.setRequiresImmediateAttention(updatedCrime.isRequiresImmediateAttention());

        if (!existing.getCategory().getId().equals(updatedCrime.getCategory().getId())) {
            CrimeCategory newCategory = crimeCategoryRepository.findById(updatedCrime.getCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            existing.setCategory(newCategory);
        }

        return crimeTypeRepository.save(existing);
    }

    public void deleteCrime(Long id) {
        CrimeType existing = crimeTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Crime not found"));
        crimeTypeRepository.delete(existing);
    }

}
