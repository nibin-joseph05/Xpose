package com.crimereport.xpose.controllers;

import com.crimereport.xpose.models.Authority;
import com.crimereport.xpose.util.JwtUtil;
import com.crimereport.xpose.services.AuthorityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

}
