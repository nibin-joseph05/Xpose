package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.User;
import com.crimereport.xpose.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/register")
    public ResponseEntity<?> mobileAuth(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        if (mobile == null || mobile.isBlank()) {
            return ResponseEntity.badRequest().body("Mobile number is required");
        }

        User user = authService.mobileAuth(mobile);
        return ResponseEntity.ok(user);
    }

    @PutMapping(value = "/update-profile/{mobile}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProfileWithImage(
            @PathVariable String mobile,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "currentProfileUrl", required = false) String currentProfileUrl
    ) {
        Optional<User> optionalUser = authService.findByMobile(mobile);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = optionalUser.get();

        String newEmail = email != null && !email.isBlank() ? email : null;

        if (newEmail != null && !newEmail.equals(user.getEmail())) {
            if (authService.isEmailAlreadyRegisteredByOtherUser(user.getId(), newEmail)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already registered by another user.");
            }
        }

        user.setName(name != null && !name.isBlank() ? name : null);
        user.setEmail(newEmail);

        String responseProfileUrl = null;

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir, "profiles");

            try {
                Files.createDirectories(uploadPath);
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                String relativePathForDb = "/uploads/profiles/" + fileName;
                user.setProfileUrl(relativePathForDb);
                responseProfileUrl = authService.buildFullUrl(relativePathForDb);
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Image upload failed: " + e.getMessage());
            }
        } else if ("REMOVE".equals(currentProfileUrl)) {
            user.setProfileUrl(null);
            responseProfileUrl = null;
        } else if (currentProfileUrl != null && currentProfileUrl.startsWith("http")) {
            user.setProfileUrl(currentProfileUrl);
            responseProfileUrl = currentProfileUrl;
        } else {
            responseProfileUrl = user.getProfileUrl();
        }

        authService.save(user);

        User userForResponse = new User();
        userForResponse.setId(user.getId());
        userForResponse.setMobile(user.getMobile());
        userForResponse.setName(user.getName());
        userForResponse.setEmail(user.getEmail());
        userForResponse.setCreatedAt(user.getCreatedAt());
        userForResponse.setProfileUrl(responseProfileUrl);

        return ResponseEntity.ok(userForResponse);
    }
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = authService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to fetch users: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Optional<User> user = authService.findById(id);
            if (user.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            authService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to delete user: " + e.getMessage()));
        }
    }
}