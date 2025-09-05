package com.crimereport.xpose.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class MLService {

    private static final Logger logger = LoggerFactory.getLogger(MLService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.api.host}")
    private String host;

    @Value("${ml.api.port}")
    private String port;

    public Map<String, Object> classifyDescription(String description) {
        try {
            String fastApiUrl = String.format("http://%s:%s/classify", host, port);
            logger.info("Sending crime description to FastAPI [{}] for ML classification...", fastApiUrl);

            Map<String, String> request = Map.of("description", description);

            Map<String, Object> response = restTemplate.postForObject(fastApiUrl, request, Map.class);

            if (response != null) {
                logger.info("Received classification from FastAPI:");
                logger.info("  - Spam: {}", response.get("is_spam"));
                logger.info("  - Hate Speech: {}", response.get("is_hate_speech"));
                logger.info("  - Toxic: {}", response.get("is_toxic"));
                logger.info("  - Urgency: {}", response.get("urgency"));
                logger.info("  - Confidence: {}", response.get("confidence"));
                logger.info("  - Quality: {}", response.get("report_quality"));
                logger.info("  - Needs Review: {}", response.get("needs_review"));

                if (response.containsKey("shap_explanation")) {
                    Map<String, Object> shapExplanation = (Map<String, Object>) response.get("shap_explanation");
                    if (shapExplanation != null) {
                        logger.info("  - SHAP Explanation available:");
                        logger.info("    * Base Value: {}", shapExplanation.get("base_value"));

                        java.util.List<Map<String, Object>> topWords =
                                (java.util.List<Map<String, Object>>) shapExplanation.get("top_influential_words");

                        if (topWords != null && !topWords.isEmpty()) {
                            logger.info("    * Top Influential Words:");
                            for (Map<String, Object> wordData : topWords) {
                                logger.info("      - Word: {}, Impact: {}, Influence: {}",
                                        wordData.get("word"),
                                        wordData.get("impact"),
                                        wordData.get("influence"));
                            }
                        } else {
                            logger.warn("    * No top influential words found in SHAP explanation");
                        }

                        java.util.List<Map<String, Object>> wordImportances =
                                (java.util.List<Map<String, Object>>) shapExplanation.get("word_importances");

                        if (wordImportances != null && !wordImportances.isEmpty()) {
                            logger.info("    * Word Importances (first 10):");
                            int count = 0;
                            for (Map<String, Object> wordData : wordImportances) {
                                if (count >= 10) break;
                                logger.info("      - Word: {}, Score: {}",
                                        wordData.get("word"),
                                        wordData.get("score"));
                                count++;
                            }
                        }
                    } else {
                        logger.warn("  - SHAP Explanation is null");
                    }
                } else {
                    logger.warn("  - No SHAP Explanation in response");
                }

                return response;
            } else {
                logger.warn("Received null response from FastAPI");
                return createErrorResponse("Null response from ML service");
            }

        } catch (HttpClientErrorException e) {
            logger.error("Client error calling FastAPI: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return createErrorResponse("Client error: " + e.getMessage());
        } catch (HttpServerErrorException e) {
            logger.error("Server error calling FastAPI: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return createErrorResponse("Server error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error calling FastAPI: {}", e.getMessage(), e);
            return createErrorResponse("Unexpected error: " + e.getMessage());
        }
    }

    public CompletableFuture<Map<String, Object>> classifyDescriptionAsync(String description) {
        return CompletableFuture.supplyAsync(() -> classifyDescription(description));
    }

    public Map<String, Object> batchClassify(java.util.List<String> descriptions) {
        try {
            String fastApiUrl = String.format("http://%s:%s/classify/batch", host, port);
            logger.info("Sending batch of {} descriptions to FastAPI", descriptions.size());

            java.util.List<Map<String, String>> requests = descriptions.stream()
                    .map(desc -> Map.of("description", desc))
                    .collect(java.util.stream.Collectors.toList());

            Map<String, Object> response = restTemplate.postForObject(fastApiUrl, Map.of("reports", requests), Map.class);

            logger.info("Received batch classification results for {} reports", descriptions.size());
            return response;

        } catch (Exception e) {
            logger.error("Error in batch classification: {}", e.getMessage(), e);
            return Map.of(
                    "error", true,
                    "message", "Batch classification failed: " + e.getMessage(),
                    "results", java.util.Collections.emptyList()
            );
        }
    }

    public boolean isMLServiceHealthy() {
        try {
            String healthUrl = String.format("http://%s:%s/health", host, port);
            Map<String, Object> response = restTemplate.getForObject(healthUrl, Map.class);

            return response != null && "healthy".equals(response.get("status"));
        } catch (Exception e) {
            logger.warn("ML service health check failed: {}", e.getMessage());
            return false;
        }
    }

    private Map<String, Object> createErrorResponse(String errorMessage) {
        return Map.ofEntries(
                Map.entry("is_spam", true),
                Map.entry("is_hate_speech", false),
                Map.entry("is_toxic", false),
                Map.entry("urgency", "LOW"),
                Map.entry("confidence", 0.0),
                Map.entry("spam_score", 1.0),
                Map.entry("report_quality", "LOW"),
                Map.entry("toxicity_analysis", Map.of()),
                Map.entry("word_count", 0),
                Map.entry("char_count", 0),
                Map.entry("needs_review", true),
                Map.entry("error", errorMessage),
                Map.entry("ml_service_available", false)
        );
    }
}