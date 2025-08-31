package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final String apiKey;

    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String translateToEnglish(String text) {
        String model = "gemini-2.5-pro";
        String prompt = "Detect the language and translate this text into English:\n" + text;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            Map response = webClient.post()
                    .uri("/" + model + ":generateContent?key=" + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("candidates")) {
                Map candidate = (Map) ((List<?>) response.get("candidates")).get(0);
                Map content = (Map) candidate.get("content");
                List<Map> parts = (List<Map>) content.get("parts");
                return (String) parts.get(0).get("text");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return text;
    }
}
