package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;

@Service
public class NewsService {

    @Value("${newsapi.key}")
    private String newsApiKey;

    public String getKeralaNews() {
        String url = "https://newsapi.org/v2/everything?q=kerala OR kochi OR trivandrum OR calicut OR malappuram OR kannur&language=en&sortBy=publishedAt&apiKey=" + newsApiKey;

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);


        JSONObject jsonResponse = new JSONObject(response.getBody());
        JSONArray articles = jsonResponse.getJSONArray("articles");

        List<Object> keralaArticles = new ArrayList<>();

        for (int i = 0; i < articles.length(); i++) {
            JSONObject article = articles.getJSONObject(i);
            String title = article.optString("title", "").toLowerCase();
            String description = article.optString("description", "").toLowerCase();

            if (title.contains("kerala") || title.contains("kochi") || title.contains("trivandrum")
                    || description.contains("kerala") || description.contains("kochi") || description.contains("trivandrum")) {
                keralaArticles.add(article);
            }
        }

        JSONObject filteredResponse = new JSONObject();
        filteredResponse.put("status", jsonResponse.getString("status"));
        filteredResponse.put("totalResults", keralaArticles.size());
        filteredResponse.put("articles", keralaArticles);

        return filteredResponse.toString();
    }
}
