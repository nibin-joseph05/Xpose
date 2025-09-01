package com.crimereport.xpose.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private final WebClient webClient;
    private final String apiKey;

    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }


    public String processAndCleanText(String text) {
        try {
            logger.info("Processing text with Gemini: {}", text.substring(0, Math.min(50, text.length())));

            String model = "gemini-2.5-pro";
            String prompt = buildComprehensivePrompt(text);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.1, "maxOutputTokens", 1024)
            );

            Map response = webClient.post()
                    .uri("/" + model + ":generateContent?key=" + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String result = extractTextFromGeminiResponse(response);
            if (result != null) {
                logger.info("Gemini processed result: {}", result.substring(0, Math.min(100, result.length())));
                return result.trim();
            }
        } catch (Exception e) {
            logger.error("Error processing text with Gemini: {}", e.getMessage(), e);
        }
        return text;
    }

    public String translateToEnglish(String text) {
        try {
            logger.info("Translating text to English: {}", text.substring(0, Math.min(50, text.length())));

            String model = "gemini-2.5-pro";
            String prompt = "Translate this text to English. Only return the translated text, nothing else:\n\n" + text;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.1, "maxOutputTokens", 512)
            );

            Map response = webClient.post()
                    .uri("/" + model + ":generateContent?key=" + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String result = extractTextFromGeminiResponse(response);
            if (result != null) {
                logger.info("Translation result: {}", result.substring(0, Math.min(100, result.length())));
                return result.trim();
            }
        } catch (Exception e) {
            logger.error("Error translating text: {}", e.getMessage(), e);
        }
        return text;
    }

    public CompletableFuture<String> processTextAsync(String text) {
        return CompletableFuture.supplyAsync(() -> processAndCleanText(text));
    }

    public boolean isTextInEnglish(String text) {
        try {
            String model = "gemini-2.5-pro";
            String prompt = "Is this text written in English? Answer only 'YES' or 'NO':\n\n" + text;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.0, "maxOutputTokens", 10)
            );

            Map response = webClient.post()
                    .uri("/" + model + ":generateContent?key=" + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String result = extractTextFromGeminiResponse(response);
            if (result != null) {
                return result.trim().toUpperCase().contains("YES");
            }
        } catch (Exception e) {
            logger.error("Error checking language: {}", e.getMessage(), e);
        }
        return isProbablyEnglish(text);
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromGeminiResponse(Map response) {
        if (response == null || !response.containsKey("candidates")) {
            return null;
        }
        List<Map> candidates = (List<Map>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }

        Map candidate = candidates.get(0);
        if (candidate == null || !candidate.containsKey("content")) {
            return null;
        }

        Map content = (Map) candidate.get("content");
        if (content == null || !content.containsKey("parts")) {
            return null;
        }

        List<Map> parts = (List<Map>) content.get("parts");
        if (parts == null || parts.isEmpty()) {
            return null;
        }

        Object textObj = parts.get(0).get("text");
        return (textObj instanceof String) ? (String) textObj : null;
    }

    private String buildComprehensivePrompt(String text) {
        return """
                Analyze and improve this crime report text. Perform these tasks in order:

                1. DETECT LANGUAGE: If not English, translate to English
                2. SPELLING & GRAMMAR: Correct any spelling mistakes and grammatical errors
                3. CLARITY: Improve clarity while preserving the original meaning
                4. STRUCTURE: Organize information logically if needed

                Rules:
                - Keep the core meaning intact
                - Don't add information that wasn't there
                - Don't remove important details
                - Make it professional but preserve urgency
                - If it's clearly spam/joke text, return: "SPAM_DETECTED"

                Original text:
                """ + text + """

                Return only the improved text:""";
    }

    private boolean isProbablyEnglish(String text) {
        if (text == null || text.isEmpty()) return true;

        int englishChars = 0;
        int totalChars = 0;

        for (char c : text.toCharArray()) {
            if (Character.isLetter(c)) {
                totalChars++;
                if (c < 128 && Character.UnicodeBlock.of(c) == Character.UnicodeBlock.BASIC_LATIN) {
                    englishChars++;
                }
            }
        }
        return totalChars == 0 || (englishChars * 100 / totalChars) > 70;
    }
}
