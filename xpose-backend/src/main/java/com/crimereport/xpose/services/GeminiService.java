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
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Deprecated
    public String processAndCleanText(String text) {
        try {
            logger.info("Processing text with Gemini (DEPRECATED): {}", text.substring(0, Math.min(50, text.length())));

            String model = "gemini-1.5-flash";
            String prompt = buildComprehensivePrompt(text);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.1, "maxOutputTokens", 1024)
            );

            Map response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/" + model + ":generateContent")
                            .queryParam("key", apiKey)
                            .build())
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

    public String improveReadabilityOnly(String text) {
        try {
            logger.info("Improving readability with Gemini: {}", text.substring(0, Math.min(50, text.length())));

            String model = "gemini-1.5-flash";
            String prompt = buildReadabilityOnlyPrompt(text);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.1, "maxOutputTokens", 1024)
            );

            Map response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/" + model + ":generateContent")
                            .queryParam("key", apiKey)
                            .build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String result = extractTextFromGeminiResponse(response);
            if (result != null) {
                logger.info("Readability improved result: {}", result.substring(0, Math.min(100, result.length())));
                return result.trim();
            }
        } catch (Exception e) {
            logger.error("Error improving readability with Gemini: {}", e.getMessage(), e);
        }
        return text;
    }

    public String translateToEnglish(String text) {
        try {
            logger.info("Force translating text to English: {}", text.substring(0, Math.min(50, text.length())));

            String model = "gemini-1.5-flash";
            String prompt = "Translate this text to English. Preserve the original tone, emotion, and intent. Only return the translated text, nothing else:\n\n" + text;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.1, "maxOutputTokens", 512)
            );

            Map response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/" + model + ":generateContent")
                            .queryParam("key", apiKey)
                            .build())
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
        return CompletableFuture.supplyAsync(() -> improveReadabilityOnly(text));
    }

    public boolean isTextInEnglish(String text) {
        try {
            String model = "gemini-1.5-flash";
            String prompt = "Is this text primarily in English? Answer only 'YES' or 'NO'. Consider mixed language as 'NO':\n\n" + text;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.0, "maxOutputTokens", 10)
            );

            Map response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/" + model + ":generateContent")
                            .queryParam("key", apiKey)
                            .build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String result = extractTextFromGeminiResponse(response);
            if (result != null) {
                boolean isEnglish = result.trim().toUpperCase().contains("YES");
                logger.info("Language detection result: {} -> {}", result.trim(), isEnglish ? "English" : "Non-English");
                return isEnglish;
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

    @Deprecated
    private String buildComprehensivePrompt(String text) {
        return """
                Analyze this crime report text and perform these tasks:

                1. DETECT LANGUAGE: If not primarily English, translate to English first
                2. SPAM DETECTION: If this looks like spam, jokes, tests, or fake content, return: "SPAM_DETECTED"
                3. CORRECTION: Fix spelling mistakes and grammatical errors
                4. CLARITY: Improve clarity while preserving original meaning

                Spam indicators:
                - Repeated words like "lol", "haha", "test"
                - Marketing language: "click here", "free money", "win prizes"
                - Jokes about crime: "robbery but just joking"
                - Nonsensical or very short meaningless text

                Rules:
                - Keep the core meaning intact
                - Don't add information that wasn't there
                - Don't remove important details
                - Make it professional but preserve urgency
                - If clearly spam/fake, return only: "SPAM_DETECTED"

                Original text:
                """ + text + """

                Return only the improved text or "SPAM_DETECTED":""";
    }

    private String buildReadabilityOnlyPrompt(String text) {
        return """
                Improve the readability and grammar of this crime report while preserving ALL original content and meaning:

                INSTRUCTIONS:
                1. Fix spelling and grammatical errors
                2. Improve sentence structure for clarity
                3. Make the text more readable and professional
                4. PRESERVE the original tone, emotion, and intent
                5. Do NOT remove, filter, or sanitize any content
                6. Do NOT add information that wasn't in the original
                7. If the original contains complaints, anger, or strong language, keep that tone
                8. If the original contains insults or harsh words, preserve them

                WHAT NOT TO DO:
                - Do NOT judge whether content is appropriate
                - Do NOT filter out complaints about police or authorities
                - Do NOT make the text overly polite if it wasn't originally
                - Do NOT remove emotional expressions
                - Do NOT sanitize harsh language

                Original text:
                """ + text + """

                Return only the improved text with better readability:""";
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
        return totalChars == 0 || (englishChars * 100 / totalChars) > 60;
    }

    public String detectLanguage(String text) {
        try {
            logger.info("Detecting language for text: {}", text.substring(0, Math.min(50, text.length())));
            String model = "gemini-1.5-flash";
            String prompt = "Detect the primary language of this text and return only the language name (e.g., 'English', 'Hindi', 'Spanish'): \n\n" + text;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.0, "maxOutputTokens", 10)
            );

            Map response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/" + model + ":generateContent")
                            .queryParam("key", apiKey)
                            .build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String result = extractTextFromGeminiResponse(response);
            if (result != null) {
                logger.info("Detected language: {}", result.trim());
                return result.trim();
            }
        } catch (Exception e) {
            logger.error("Error detecting language: {}", e.getMessage(), e);
        }
        return "Unknown";
    }
}