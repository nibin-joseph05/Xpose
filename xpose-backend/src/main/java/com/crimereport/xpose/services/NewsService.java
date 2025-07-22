package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NewsService {

    @Value("${newsapi.key}")
    private String newsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getIndiaCrimeNews() {
        String url = "https://newsapi.org/v2/everything?q=India+crime&sortBy=publishedAt&pageSize=20&apiKey=" + newsApiKey;
        RestTemplate restTemplate = new RestTemplate();

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to fetch crime news.");
            return error;
        }
    }

}
