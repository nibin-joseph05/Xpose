package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.User;
import com.crimereport.xpose.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> mobileAuth(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        if (mobile == null || mobile.isBlank()) {
            return ResponseEntity.badRequest().body("Mobile number is required");
        }

        User user = authService.mobileAuth(mobile);
        return ResponseEntity.ok(user);
    }

    @PutMapping(value = "/update-profile/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProfileWithImage(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        Optional<User> optionalUser = authService.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = optionalUser.get();

        if (!name.isBlank()) user.setName(name);
        if (!email.isBlank()) user.setEmail(email);

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/profiles");

            try {
                Files.createDirectories(uploadPath);
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                user.setProfileUrl("/uploads/profiles/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Image upload failed");
            }
        }

        authService.save(user);
        return ResponseEntity.ok(user);
    }

}
