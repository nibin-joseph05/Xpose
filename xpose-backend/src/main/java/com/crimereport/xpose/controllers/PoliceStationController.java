package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.Authority;
import com.crimereport.xpose.models.PoliceStation;
import com.crimereport.xpose.repository.AuthorityRepository;
import com.crimereport.xpose.repository.PoliceStationRepository;
import com.crimereport.xpose.services.AuthorityService;
import com.crimereport.xpose.services.PoliceStationService;
import com.crimereport.xpose.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/police-stations")
@CrossOrigin(origins = "*")
public class PoliceStationController {

    @Autowired
    private PoliceStationService policeStationService;

    @Autowired
    private PoliceStationRepository policeStationRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthorityService authorityService;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePoliceStation(@PathVariable Long id) {
        try {
            Optional<PoliceStation> station = policeStationRepository.findById(id);
            if (station.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "Police station not found"));
            }

            List<Authority> assignedOfficers = authorityRepository.findByStationId(id);
            if (!assignedOfficers.isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("message", "Cannot delete station with assigned officers. Please reassign or remove officers first."));
            }

            policeStationRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Police station deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to delete police station: " + e.getMessage()));
        }
    }

    @GetMapping("/my-station")
    public ResponseEntity<?> getMyStation(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            Optional<Authority> optionalAuthority = authorityService.findByEmail(email);

            if (optionalAuthority.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            Authority officer = optionalAuthority.get();

            if (officer.getStation() == null) {
                return ResponseEntity.status(404).body(Map.of("message", "No station assigned to this officer"));
            }

            PoliceStation station = officer.getStation();

            List<Map<String, Object>> stationOfficers = authorityService.getPoliceByStation(station.getId());

            Map<String, Object> stationResponse = new HashMap<>();
            stationResponse.put("id", station.getId());
            stationResponse.put("name", station.getName());
            stationResponse.put("address", station.getAddress());
            stationResponse.put("latitude", station.getLatitude());
            stationResponse.put("longitude", station.getLongitude());
            stationResponse.put("createdAt", station.getCreatedAt());
            stationResponse.put("updatedAt", station.getUpdatedAt());

            Map<String, Object> response = new HashMap<>();
            response.put("station", stationResponse);
            response.put("officers", stationOfficers);
            response.put("totalOfficers", stationOfficers.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token or unauthorized access"));
        }
    }

}