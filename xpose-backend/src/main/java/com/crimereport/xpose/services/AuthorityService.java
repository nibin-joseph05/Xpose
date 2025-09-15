package com.crimereport.xpose.services;

import com.crimereport.xpose.models.Authority;
import com.crimereport.xpose.models.PoliceStation;
import com.crimereport.xpose.repository.AuthorityRepository;
import com.crimereport.xpose.repository.PoliceStationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

@Service
public class AuthorityService {

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PoliceStationRepository policeStationRepository;

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

    public boolean updatePassword(String email, String currentPassword, String newPassword) {
        Optional<Authority> optionalAuthority = authorityRepository.findByEmail(email);
        if (optionalAuthority.isPresent()) {
            Authority authority = optionalAuthority.get();
            if (passwordEncoder.matches(currentPassword, authority.getPassword())) {
                authority.setPassword(passwordEncoder.encode(newPassword));
                authorityRepository.save(authority);
                return true;
            }
        }
        return false;
    }

    public Authority createPoliceOfficer(Authority officer, Long stationId) {
        officer.setRole("POLICE");
        officer.setCreatedAt(LocalDateTime.now());

        if (stationId != null && stationId > 0) {
            Optional<PoliceStation> station = policeStationRepository.findById(stationId);
            if (station.isPresent()) {
                officer.setStation(station.get());
            } else {
                throw new IllegalArgumentException("Police station with ID " + stationId + " not found");
            }
        } else {
            officer.setStation(null);
        }

        officer.setPassword(passwordEncoder.encode(officer.getPassword()));

        return authorityRepository.save(officer);
    }

    public List<Map<String, Object>> getAllPoliceOfficers() {
        List<Authority> officers = authorityRepository.findByRole("POLICE");
        return officers.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPoliceByStation(Long stationId) {
        List<Authority> officers = authorityRepository.findByStationId(stationId);
        return officers.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private Map<String, Object> convertToDTO(Authority officer) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", officer.getId());
        dto.put("name", officer.getName());
        dto.put("email", officer.getEmail());
        dto.put("phoneNumber", officer.getPhoneNumber());
        dto.put("role", officer.getRole());
        dto.put("createdAt", officer.getCreatedAt());
        dto.put("updatedAt", officer.getUpdatedAt());

        if (officer.getStation() != null) {
            Map<String, Object> stationInfo = new HashMap<>();
            stationInfo.put("id", officer.getStation().getId());
            stationInfo.put("name", officer.getStation().getName());
            stationInfo.put("address", officer.getStation().getAddress());
            dto.put("station", stationInfo);
            dto.put("stationId", officer.getStation().getId());
            dto.put("stationName", officer.getStation().getName());
        } else {
            dto.put("station", null);
            dto.put("stationId", null);
            dto.put("stationName", "Unassigned");
        }

        return dto;
    }
}