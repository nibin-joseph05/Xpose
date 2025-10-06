package com.crimereport.xpose.repository;

import com.crimereport.xpose.models.PoliceStation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PoliceStationRepository extends JpaRepository<PoliceStation, Long> {
    Optional<PoliceStation> findByName(String name);
}
