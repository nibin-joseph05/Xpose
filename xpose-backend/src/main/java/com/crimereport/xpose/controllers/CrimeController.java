package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.CrimeType;
import com.crimereport.xpose.services.CrimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

}
