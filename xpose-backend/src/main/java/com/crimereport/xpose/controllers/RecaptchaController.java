package com.crimereport.xpose.controllers;

import com.crimereport.xpose.services.RecaptchaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recaptcha")
@CrossOrigin(origins = "*")
public class RecaptchaController {

    private final RecaptchaService recaptchaService;

    public RecaptchaController(RecaptchaService recaptchaService) {
        this.recaptchaService = recaptchaService;
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
//        System.out.println("Spring Boot received token from Flutter: '" + token + "'");
//        System.out.println("Token length: " + (token != null ? token.length() : "null"));

        boolean isValid = recaptchaService.verifyToken(token);

        if (isValid) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Invalid reCAPTCHA"));
        }
    }
}