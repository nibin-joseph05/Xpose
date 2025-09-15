package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.PoliceStation;
import com.crimereport.xpose.services.PoliceStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/police-stations")
@CrossOrigin(origins = "*")
public class PoliceStationController {

    @Autowired
    private PoliceStationService policeStationService;

    @GetMapping
    public ResponseEntity<?> getNearbyStations(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "20000") int radius) {
        return ResponseEntity.ok(policeStationService.getNearbyPoliceStations(lat, lng, radius));
    }

    @GetMapping("/by-district")
    public ResponseEntity<?> getStationsByDistrict(
            @RequestParam String state,
            @RequestParam String district,
            @RequestParam(defaultValue = "20000") int radius) {
        return ResponseEntity.ok(
                policeStationService.getStationsByDistrict(state.trim(), district.trim(), radius)
        );
    }

    @GetMapping("/states")
    public ResponseEntity<?> getStates() {
        return ResponseEntity.ok(policeStationService.getAllStates());
    }

    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts(@RequestParam String state) {
        return ResponseEntity.ok(policeStationService.getDistrictsByState(state));
    }

    @PostMapping
    public ResponseEntity<?> createPoliceStation(@RequestBody PoliceStation policeStation) {
        try {
            PoliceStation createdStation = policeStationService.createPoliceStation(policeStation);
            return ResponseEntity.ok(createdStation);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", "Failed to add police station: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPoliceStations() {
        try {
            return ResponseEntity.ok(policeStationService.getAllPoliceStations());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to fetch police stations: " + e.getMessage()));
        }
    }

}