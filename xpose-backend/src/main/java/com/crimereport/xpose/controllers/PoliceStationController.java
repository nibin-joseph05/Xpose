package com.crimereport.xpose.controllers;

import com.crimereport.xpose.services.PoliceStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(defaultValue = "3000") int radius) {

        return ResponseEntity.ok(policeStationService.getNearbyPoliceStations(lat, lng, radius));
    }

//    @GetMapping("/by-district")
//    public ResponseEntity<?> getStationsByDistrict(
//            @RequestParam String state,
//            @RequestParam String district,
//            @RequestParam(defaultValue = "10000") int radius) {
//
//        return ResponseEntity.ok(
//                policeStationService.getStationsByDistrict(state.trim(), district.trim(), radius)
//        );
//    }

}
