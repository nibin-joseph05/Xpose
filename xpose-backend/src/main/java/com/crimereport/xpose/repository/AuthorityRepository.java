package com.crimereport.xpose.repository;

import com.crimereport.xpose.models.Authority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import java.util.List;

public interface AuthorityRepository extends JpaRepository<Authority, Long> {
    Optional<Authority> findByEmail(String email);

    List<Authority> findByRole(String role);

    List<Authority> findByStationId(Long stationId);
}

