package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.CrimeType;
import com.crimereport.xpose.services.CrimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/crimes")
@CrossOrigin(origins = "*")
public class CrimeController {

    @Autowired
    private CrimeService crimeService;

    @PostMapping
    public ResponseEntity<?> addCrime(@RequestBody CrimeType crime) {
        try {
            CrimeType saved = crimeService.addCrime(crime);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllCrimes() {
        return ResponseEntity.ok(crimeService.getAllCrimes());
    }

    @GetMapping("/dto")
    public ResponseEntity<?> getAllCrimesDTO() {
        return ResponseEntity.ok(crimeService.getAllCrimeDTOs());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCrime(@PathVariable Long id, @RequestBody CrimeType updatedCrime) {
        try {
            CrimeType crime = crimeService.updateCrime(id, updatedCrime);
            return ResponseEntity.ok(crime);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCrime(@PathVariable Long id) {
        try {
            crimeService.deleteCrime(id);
            return ResponseEntity.ok("Crime type deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
