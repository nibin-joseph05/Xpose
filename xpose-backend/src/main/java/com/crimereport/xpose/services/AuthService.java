package com.crimereport.xpose.services;

import com.crimereport.xpose.models.User;
import com.crimereport.xpose.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Optional<User> findById(Long id) {
        return userRepo.findById(id);
    }

    public Optional<User> findByMobile(String mobile) {
        return userRepo.findByMobile(mobile);
    }

    public void save(User user) {
        userRepo.save(user);
    }
}