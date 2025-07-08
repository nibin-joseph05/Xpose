package com.crimereport.xpose.services;

import com.crimereport.xpose.models.Authority;
import com.crimereport.xpose.repository.AuthorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthorityService {

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Authority createAuthority(Authority authority) {
        authority.setPassword(passwordEncoder.encode(authority.getPassword()));
        return authorityRepository.save(authority);
    }

    public Optional<Authority> findByEmail(String email) {
        return authorityRepository.findByEmail(email);
    }

    public boolean authenticate(String email, String rawPassword) {
        Optional<Authority> optionalAuthority = authorityRepository.findByEmail(email);
        if (optionalAuthority.isPresent()) {
            Authority authority = optionalAuthority.get();
            return passwordEncoder.matches(rawPassword, authority.getPassword());
        }
        return false;
    }

    public Authority updateAuthority(Authority authority) {
        return authorityRepository.save(authority);
    }
}
