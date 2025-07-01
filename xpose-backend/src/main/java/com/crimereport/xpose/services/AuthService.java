package com.crimereport.xpose.services;

import com.crimereport.xpose.models.User;
import com.crimereport.xpose.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    public User mobileAuth(String mobile) {
        Optional<User> existingUser = userRepo.findByMobile(mobile);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        User newUser = new User(mobile);
        return userRepo.save(newUser);
    }

    public Optional<User> updateProfile(Long id, Map<String, String> data) {
        Optional<User> optionalUser = userRepo.findById(id);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (data.containsKey("name")) user.setName(data.get("name"));
            if (data.containsKey("email")) user.setEmail(data.get("email"));
            if (data.containsKey("profileUrl")) user.setProfileUrl(data.get("profileUrl"));
//            if (data.containsKey("mobile")) user.setMobile(data.get("mobile")); // ith mattanda later venee add chyam

            userRepo.save(user);
            return Optional.of(user);
        }

        return Optional.empty();
    }

    public Optional<User> findById(Long id) {
        return userRepo.findById(id);
    }

    public void save(User user) {
        userRepo.save(user);
    }

}
