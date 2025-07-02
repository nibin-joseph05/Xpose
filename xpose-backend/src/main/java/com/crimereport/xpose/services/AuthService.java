package com.crimereport.xpose.services;

import com.crimereport.xpose.models.User;
import com.crimereport.xpose.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Value("${server.address}")
    private String serverAddress;

    @Value("${server.port}")
    private String serverPort;

    public User mobileAuth(String mobile) {
        Optional<User> existingUser = userRepo.findByMobile(mobile);

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            user = new User(mobile);
            user = userRepo.save(user);
        }

        if (user.getProfileUrl() != null && user.getProfileUrl().startsWith("/uploads")) {
            user.setProfileUrl(buildFullUrl(user.getProfileUrl()));
        }
        return user;
    }

    public Optional<User> findById(Long id) {
        Optional<User> userOptional = userRepo.findById(id);
        userOptional.ifPresent(user -> {
            if (user.getProfileUrl() != null && user.getProfileUrl().startsWith("/uploads")) {
                user.setProfileUrl(buildFullUrl(user.getProfileUrl()));
            }
        });
        return userOptional;
    }

    public Optional<User> findByMobile(String mobile) {
        Optional<User> userOptional = userRepo.findByMobile(mobile);
        userOptional.ifPresent(user -> {
            if (user.getProfileUrl() != null && user.getProfileUrl().startsWith("/uploads")) {
                user.setProfileUrl(buildFullUrl(user.getProfileUrl()));
            }
        });
        return userOptional;
    }

    public User save(User user) {
        User savedUser = userRepo.save(user);
        if (savedUser.getProfileUrl() != null && savedUser.getProfileUrl().startsWith("/uploads")) {
            savedUser.setProfileUrl(buildFullUrl(savedUser.getProfileUrl()));
        }
        return savedUser;
    }

    public String buildFullUrl(String relativePath) {
        String path = relativePath.startsWith("/") ? relativePath : "/" + relativePath;
        return "http://" + serverAddress + ":" + serverPort + path;
    }

    public boolean isEmailAlreadyRegisteredByOtherUser(Long userId, String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        Optional<User> existingUser = userRepo.findByEmail(email);
        return existingUser.isPresent() && !existingUser.get().getId().equals(userId);
    }
}