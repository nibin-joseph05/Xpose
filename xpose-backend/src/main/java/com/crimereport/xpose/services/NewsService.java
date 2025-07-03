package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NewsService {

    @Value("${newsapi.key}")
    private String newsApiKey;

    private static final String NEWS_API_URL = "https://newsapi.org/v2/everything?q=kerala&language=en&sortBy=publishedAt&apiKey=";

    public String getKeralaNews() {
        String url = NEWS_API_URL + newsApiKey;
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }
}
