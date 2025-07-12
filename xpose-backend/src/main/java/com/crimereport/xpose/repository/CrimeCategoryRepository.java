package com.crimereport.xpose.repository;

import com.crimereport.xpose.models.CrimeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CrimeCategoryRepository extends JpaRepository<CrimeCategory, Long> {
    Optional<CrimeCategory> findByName(String name);
    boolean existsByName(String name);
}
