package com.crimereport.xpose.repository;

import com.crimereport.xpose.models.CrimeType;
import com.crimereport.xpose.models.CrimeType.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CrimeTypeRepository extends JpaRepository<CrimeType, Long> {
    Optional<CrimeType> findByName(String name);
    boolean existsByName(String name);
    List<CrimeType> findByCategoryId(Long categoryId);
    List<CrimeType> findByPriority(Priority priority);
    List<CrimeType> findByRequiresImmediateAttentionTrue();
}
