package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import jakarta.annotation.PostConstruct;

@Service
public class NewsService {

    @Value("${newsapi.key}")
    private String newsApiKey;

    @Value("${kerala.keywords}")
    private String keralaKeywordsString;

    @Value("${crime.keywords}")
    private String crimeKeywordsString;

    private Set<String> keralaKeywords;
    private Set<String> crimeKeywords;

    @PostConstruct
    public void init() {
        this.keralaKeywords = new HashSet<>(Arrays.asList(keralaKeywordsString.split(",")));
        this.crimeKeywords = new HashSet<>(Arrays.asList(crimeKeywordsString.split(",")));
    }

    public String getKeralaCrimeNews() {
        String apiQuery = "Kerala crime";

        String encodedApiQuery = URLEncoder.encode(apiQuery, StandardCharsets.UTF_8);

        String url = "https://newsapi.org/v2/everything?q=" + encodedApiQuery + "&language=en&sortBy=publishedAt&apiKey=" + newsApiKey;

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        JSONObject jsonResponse = new JSONObject(response.getBody());
        JSONArray articles = jsonResponse.optJSONArray("articles");

        List<JSONObject> filteredArticles = new ArrayList<>();

        if (articles != null) {
            for (int i = 0; i < articles.length(); i++) {
                JSONObject article = articles.getJSONObject(i);
                String title = article.optString("title", "").toLowerCase();
                String description = article.optString("description", "").toLowerCase();
                String content = article.optString("content", "").toLowerCase();

                boolean hasKeralaKeyword = containsAny(title, keralaKeywords) || containsAny(description, keralaKeywords);
                boolean hasCrimeKeyword = containsAny(title, crimeKeywords) || containsAny(description, crimeKeywords) || containsAny(content, crimeKeywords);

                if (hasKeralaKeyword && hasCrimeKeyword) {
                    filteredArticles.add(article);
                }
            }
        }

        JSONObject filteredResponse = new JSONObject();
        filteredResponse.put("status", jsonResponse.optString("status", "ok"));
        filteredResponse.put("totalResults", filteredArticles.size());
        filteredResponse.put("articles", filteredArticles);

        return filteredResponse.toString();
    }

    private boolean containsAny(String text, Set<String> keywords) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        for (String keyword : keywords) {
            if (text.contains(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
}