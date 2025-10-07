package com.crimereport.xpose.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {
    private static final Logger logger = LoggerFactory.getLogger(GeocodingService.class);

    @Value("${placesapi.key}")
    private String placesApiKey;

    private final String GEOCODING_BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

    public static class Coordinates {
        public Double latitude;
        public Double longitude;

        public Coordinates(Double latitude, Double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }

    public Coordinates getCoordinatesFromAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            logger.warn("Empty address provided for geocoding");
            return null;
        }

        logger.info("Fetching coordinates for address: {}", address);

        String uri = UriComponentsBuilder.fromHttpUrl(GEOCODING_BASE_URL)
                .queryParam("address", address)
                .queryParam("key", placesApiKey)
                .toUriString();

        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.getForObject(uri, Map.class);

        if (response != null && "OK".equals(response.get("status"))) {
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (!results.isEmpty()) {
                Map<String, Object> geometry = (Map<String, Object>) results.get(0).get("geometry");
                Map<String, Object> location = (Map<String, Object>) geometry.get("location");
                Double lat = (Double) location.get("lat");
                Double lng = (Double) location.get("lng");
                logger.info("Coordinates found: lat={}, lng={}", lat, lng);
                return new Coordinates(lat, lng);
            }
        }

        logger.warn("No coordinates found for address: {}. API response: {}", address, response);
        return null;
    }
}