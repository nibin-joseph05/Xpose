package com.crimereport.xpose.services;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.InputStream;
import java.util.*;

@Service
public class PoliceStationService {

    @Value("${placesapi.key}")
    private String placesApiKey;

    private final String PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    private final String GEOCODING_BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
    private Map<String, double[]> districtCoordinates = new HashMap<>();

    @PostConstruct
    public void loadDistrictCoordinates() {
        try (InputStream is = getClass().getResourceAsStream("/excel-data/india_districts.xlsx");
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue;

                String state = row.getCell(0).getStringCellValue().trim().toLowerCase();
                String district = row.getCell(1).getStringCellValue().trim().toLowerCase();
                double lat = row.getCell(2).getNumericCellValue();
                double lng = row.getCell(3).getNumericCellValue();

                districtCoordinates.put(state + "-" + district, new double[]{lat, lng});
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Map<String, Object> getNearbyPoliceStations(double lat, double lng, int radius) {
        String uri = UriComponentsBuilder.fromHttpUrl(PLACES_BASE_URL)
                .queryParam("location", lat + "," + lng)
                .queryParam("radius", radius)
                .queryParam("type", "police")
                .queryParam("key", placesApiKey)
                .toUriString();

        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.getForObject(uri, Map.class);

        Map<String, String> locationDetails = findStateAndDistrict(lat, lng);
        response.put("state", locationDetails.get("state"));
        response.put("district", locationDetails.get("district"));
        return response;
    }

    public Map<String, Object> getStationsByDistrict(String state, String district, int radius) {
        double[] coords = getLatLngForDistrict(state, district);

        if (coords == null) {
            throw new IllegalArgumentException("Coordinates not found for given district.");
        }

        Map<String, Object> response = getNearbyPoliceStations(coords[0], coords[1], radius);
        response.put("state", capitalizeWords(state));
        response.put("district", capitalizeWords(district));
        return response;
    }

    private double[] getLatLngForDistrict(String state, String district) {
        return districtCoordinates.get((state.trim().toLowerCase()) + "-" + (district.trim().toLowerCase()));
    }

    public Map<String, String> findStateAndDistrict(double lat, double lng) {
        double minDistance = Double.MAX_VALUE;
        String closestState = "Unknown";
        String closestDistrict = "Unknown";

        for (Map.Entry<String, double[]> entry : districtCoordinates.entrySet()) {
            String[] parts = entry.getKey().split("-");
            String state = parts[0];
            String district = parts[1];
            double[] coords = entry.getValue();
            double distance = calculateDistance(lat, lng, coords[0], coords[1]);

            if (distance < minDistance) {
                minDistance = distance;
                closestState = capitalizeWords(state);
                closestDistrict = capitalizeWords(district);
            }
        }

        return Map.of("state", closestState, "district", closestDistrict);
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double earthRadius = 6371e3;
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    public List<String> getAllStates() {
        Set<String> states = new HashSet<>();
        for (String key : districtCoordinates.keySet()) {
            String state = key.split("-")[0];
            states.add(capitalizeWords(state));
        }
        return states.stream().sorted().toList();
    }

    private String capitalizeWords(String input) {
        return Arrays.stream(input.split(" "))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1))
                .reduce((a, b) -> a + " " + b)
                .orElse(input);
    }

    public List<String> getDistrictsByState(String state) {
        String normalizedState = state.trim().toLowerCase();
        Set<String> districts = new HashSet<>();

        for (String key : districtCoordinates.keySet()) {
            if (key.startsWith(normalizedState + "-")) {
                String district = key.split("-")[1];
                districts.add(capitalizeWords(district));
            }
        }

        return districts.stream().sorted().toList();
    }
}