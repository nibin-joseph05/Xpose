package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.Authority;
import com.crimereport.xpose.util.JwtUtil;
import com.crimereport.xpose.services.AuthorityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/authority")
@CrossOrigin(origins = "*")
public class AuthorityController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthorityService authorityService;

    @PostMapping("/create")
    public ResponseEntity<?> createAuthority(@RequestBody Authority authority) {
        Authority created = authorityService.createAuthority(authority);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Authority loginRequest) {
        boolean authenticated = authorityService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        if (authenticated) {
            String token = jwtUtil.generateToken(loginRequest.getEmail());
            return ResponseEntity.ok(Map.of("token", token, "message", "Login Successful"));
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid Credentials"));
        }
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            Optional<Authority> authority = authorityService.findByEmail(email);
            if (authority.isPresent()) {
                Authority user = authority.get();
                Map<String, String> userData = new HashMap<>();
                userData.put("id", String.valueOf(user.getId()));
                userData.put("name", user.getName());
                userData.put("email", user.getEmail());
                userData.put("phoneNumber", user.getPhoneNumber());
                userData.put("role", user.getRole());
                userData.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
                userData.put("updatedAt", user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : "");
                return ResponseEntity.ok(userData);
            }
            return ResponseEntity.status(404).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> updates) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            Optional<Authority> optionalAuthority = authorityService.findByEmail(email);

            if (optionalAuthority.isPresent()) {
                Authority authority = optionalAuthority.get();
                String newName = updates.get("name");
                String newPhoneNumber = updates.get("phoneNumber");

                if (newName != null && !newName.matches("^[a-zA-Z\\s]+$")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Name can only contain letters and spaces."));
                }
                if (newPhoneNumber != null && !newPhoneNumber.matches("^\\d{10}$")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Phone number must be exactly 10 digits."));
                }

                if (newName != null) {
                    authority.setName(newName);
                }
                if (newPhoneNumber != null) {
                    authority.setPhoneNumber(newPhoneNumber);
                }
                authority.setUpdatedAt(LocalDateTime.now());
                Authority updatedAuthority = authorityService.updateAuthority(authority);

                Map<String, String> responseData = new HashMap<>();
                responseData.put("id", String.valueOf(updatedAuthority.getId()));
                responseData.put("name", updatedAuthority.getName());
                responseData.put("email", updatedAuthority.getEmail());
                responseData.put("phoneNumber", updatedAuthority.getPhoneNumber());
                responseData.put("role", updatedAuthority.getRole());
                responseData.put("createdAt", updatedAuthority.getCreatedAt() != null ? updatedAuthority.getCreatedAt().toString() : "");
                responseData.put("updatedAt", updatedAuthority.getUpdatedAt() != null ? updatedAuthority.getUpdatedAt().toString() : "");

                return ResponseEntity.ok(responseData);
            }
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid token or unauthorized access"));
        }
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> passwordUpdate) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            String currentPassword = passwordUpdate.get("currentPassword");
            String newPassword = passwordUpdate.get("newPassword");

            if (currentPassword == null || newPassword == null || currentPassword.isEmpty() || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Current password and new password are required."));
            }

            String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
            if (!newPassword.matches(passwordRegex)) {
                return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."));
            }

            boolean updated = authorityService.updatePassword(email, currentPassword, newPassword);
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Password updated successfully!"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid current password."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid token or unauthorized access"));
        }
    }

    @PostMapping("/create-police")
    public ResponseEntity<?> createPolice(@RequestBody Map<String, Object> request) {
        try {
            Long stationId = null;
            if (request.containsKey("stationId") && request.get("stationId") != null) {
                Object stationIdObj = request.get("stationId");
                if (stationIdObj instanceof Number) {
                    stationId = ((Number) stationIdObj).longValue();
                } else if (stationIdObj instanceof String && !((String) stationIdObj).isEmpty()) {
                    try {
                        stationId = Long.valueOf((String) stationIdObj);
                    } catch (NumberFormatException e) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Invalid station ID format"));
                    }
                }
            }

            if (!request.containsKey("name") || request.get("name") == null ||
                    request.get("name").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Officer name is required"));
            }

            if (!request.containsKey("email") || request.get("email") == null ||
                    request.get("email").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Officer email is required"));
            }

            if (!request.containsKey("password") || request.get("password") == null ||
                    request.get("password").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Officer password is required"));
            }

            Authority officer = new Authority();
            officer.setName(request.get("name").toString().trim());
            officer.setEmail(request.get("email").toString().trim());
            officer.setPassword(request.get("password").toString());

            if (request.containsKey("phoneNumber") && request.get("phoneNumber") != null) {
                officer.setPhoneNumber(request.get("phoneNumber").toString().trim());
            }

            Authority created = authorityService.createPoliceOfficer(officer, stationId);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create police officer: " + e.getMessage()));
        }
    }

    @GetMapping("/police")
    public ResponseEntity<?> getAllPolice() {
        return ResponseEntity.ok(authorityService.getAllPoliceOfficers());
    }

    @GetMapping("/police/station/{stationId}")
    public ResponseEntity<?> getPoliceByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(authorityService.getPoliceByStation(stationId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAuthority(@PathVariable Long id) {
        try {
            Optional<Authority> authority = authorityService.findById(id);
            if (authority.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "Authority not found"));
            }

            authorityService.deleteAuthority(id);
            return ResponseEntity.ok(Map.of("message", "Authority deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to delete authority: " + e.getMessage()));
        }
    }

}

