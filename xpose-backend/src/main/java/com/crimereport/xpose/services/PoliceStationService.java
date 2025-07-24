package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
public class PoliceStationService {

    @Value("${placesapi.key}")
    private String placesApiKey;

    private final String PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

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

//    public Map<String, Object> getStationsByDistrict(String state, String district, int radius) {
//        double[] coords = getLatLngForDistrict(state, district);
//
//        if (coords == null) {
//            throw new IllegalArgumentException("Coordinates not found for given district.");
//        }
//
//        return getNearbyPoliceStations(coords[0], coords[1], radius);
//    }

//    // Example only — you can expand this to a full India dataset
//    private double[] getLatLngForDistrict(String state, String district) {
//        state = state.toLowerCase();
//        district = district.toLowerCase();
//
//        if (state.equals("kerala") && district.equals("idukki")) {
//            return new double[]{9.8497, 77.1025};
//        }
//
//        if (state.equals("kerala") && district.equals("ernakulam")) {
//            return new double[]{10.0480, 76.3129};
//        }
//
//        return null;
//    }


}
