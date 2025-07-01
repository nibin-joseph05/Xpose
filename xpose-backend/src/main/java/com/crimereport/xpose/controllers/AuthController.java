package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.User;
import com.crimereport.xpose.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/register")
    public ResponseEntity<?> mobileAuth(@RequestBody java.util.Map<String, String> body) {
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

        if (name != null && !name.isBlank()) {
            user.setName(name);
        } else {
            user.setName(null);
        }

        if (email != null && !email.isBlank()) {
            user.setEmail(email);
        } else {
            user.setEmail(null);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir, "profiles");

            try {
                Files.createDirectories(uploadPath);
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                user.setProfileUrl("/uploads/profiles/" + fileName);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Image upload failed: " + e.getMessage());
            }
        } else if ("REMOVE".equals(currentProfileUrl)) {
            user.setProfileUrl(null);
        } else if (currentProfileUrl != null && currentProfileUrl.startsWith("http")) {
            user.setProfileUrl(currentProfileUrl);
        }

        authService.save(user);
        return ResponseEntity.ok(user);
    }
}