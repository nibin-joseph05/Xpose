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
        return restTemplate.getForObject(uri, Map.class);
    }

    public Map<String, Object> getStationsByDistrict(String state, String district, int radius) {
        double[] coords = getLatLngForDistrict(state, district);

        if (coords == null) {
            throw new IllegalArgumentException("Coordinates not found for given district.");
        }

        return getNearbyPoliceStations(coords[0], coords[1], radius);
    }

    private double[] getLatLngForDistrict(String state, String district) {
        return districtCoordinates.get((state.trim().toLowerCase()) + "-" + (district.trim().toLowerCase()));
    }
}

