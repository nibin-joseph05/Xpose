package com.crimereport.xpose.services;

import com.crimereport.xpose.dto.CrimeReportRequest;
import com.crimereport.xpose.util.TrackingIdGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class CrimeReportService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private MLService mlService;

    private static final Logger logger = LoggerFactory.getLogger(CrimeReportService.class);

    public Map<String, Object> submitCrimeReport(CrimeReportRequest request) {
        try {
            logger.info("===  CRIME REPORT PROCESSING STARTED ===");

            String originalDescription = request.getDescription();
            logger.info("Original Description: {}", originalDescription);

            String processedDescription = processDescription(originalDescription);
            logger.info("Processed Description: {}", processedDescription);

            if ("SPAM_DETECTED".equals(processedDescription)) {
                logger.warn("Gemini detected spam in description");
                return createSpamResponse(originalDescription);
            }

            Map<String, Object> mlResult = mlService.classifyDescription(processedDescription);
            Map<String, Object> validatedResult = applyValidationOverrides(mlResult, processedDescription);

            logger.info("===  ML CLASSIFICATION RESULTS ===");
            logMLResults(validatedResult);

            boolean isSpamOrToxic = (Boolean) validatedResult.getOrDefault("is_spam", false) ||
                    (Boolean) validatedResult.getOrDefault("is_toxic", false) ||
                    (Boolean) validatedResult.getOrDefault("is_hate_speech", false);

            if (isSpamOrToxic) {
                logger.warn("Report flagged as spam/toxic/hate speech after validation");
                return createRejectedResponse(originalDescription, processedDescription, validatedResult);
            }

            logReportDetails(request, originalDescription, processedDescription, validatedResult);

            return createSuccessResponse(originalDescription, processedDescription, validatedResult);

        } catch (Exception e) {
            logger.error("Error processing crime report submission: {}", e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }
    }

    public CompletableFuture<Map<String, Object>> submitCrimeReportAsync(CrimeReportRequest request) {
        return CompletableFuture.supplyAsync(() -> submitCrimeReport(request));
    }

    private String processDescription(String originalDescription) {
        try {
            boolean isEnglish = geminiService.isTextInEnglish(originalDescription);

            if (!isEnglish) {
                logger.info("Text not in English, force translating...");
                String translated = geminiService.translateToEnglish(originalDescription);
                return geminiService.processAndCleanText(translated);
            } else {
                logger.info("Text is in English, processing for spam detection and grammar...");
                return geminiService.processAndCleanText(originalDescription);
            }
        } catch (Exception e) {
            logger.error("Error processing description with Gemini: {}", e.getMessage());
            return originalDescription;
        }
    }

    private void logMLResults(Map<String, Object> mlResult) {
        logger.info("  - Is Spam: {}", mlResult.get("is_spam"));
        logger.info("  - Is Hate Speech: {}", mlResult.get("is_hate_speech"));
        logger.info("  - Is Toxic: {}", mlResult.get("is_toxic"));
        logger.info("  - Urgency Level: {}", mlResult.get("urgency"));
        logger.info("  - Overall Confidence: {}", mlResult.get("confidence"));
        logger.info("  - Spam Score: {}", mlResult.get("spam_score"));
        logger.info("  - Report Quality: {}", mlResult.get("report_quality"));
        logger.info("  - Needs Manual Review: {}", mlResult.get("needs_review"));
        logger.info("  - Word Count: {}", mlResult.get("word_count"));
        logger.info("  - Character Count: {}", mlResult.get("char_count"));

        Map<String, Object> toxicityAnalysis = (Map<String, Object>) mlResult.get("toxicity_analysis");
        if (toxicityAnalysis != null && !toxicityAnalysis.isEmpty()) {
            logger.info("  - Toxicity Scores:");
            toxicityAnalysis.forEach((key, value) ->
                    logger.info("    * {}: {}", key, value));
        }
    }

    private void logReportDetails(CrimeReportRequest request, String original, String processed, Map<String, Object> mlResult) {
        logger.info("=== CRIME REPORT DETAILS ===");
        logger.info("Timestamp: {}", LocalDateTime.now());
        logger.info("Category ID: {}", request.getCategoryId());
        logger.info("Category Name: {}", request.getCategoryName());
        logger.info("Crime Type: {}", request.getCrimeType());
        logger.info("Original Description Length: {} chars", original.length());
        logger.info("Processed Description Length: {} chars", processed.length());
        logger.info("Location: {}", request.getPlace());
        logger.info("State: {}", request.getState());
        logger.info("District: {}", request.getDistrict());
        logger.info("Police Station: {}", request.getPoliceStation());
        logger.info("Files Attached: {}", request.getFiles() != null ? request.getFiles().size() : 0);

        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            logger.info("File Names: {}", String.join(", ", request.getFiles()));
        }

        logger.info("ML Urgency Assessment: {}", mlResult.get("urgency"));
        logger.info("Requires Priority Handling: {}", "HIGH".equals(mlResult.get("urgency")) ||
                Boolean.TRUE.equals(mlResult.get("needs_review")));
        logger.info("=== END CRIME REPORT DETAILS ===");
    }

    private Map<String, Object> createSuccessResponse(String original, String processed, Map<String, Object> mlResult) {
        String reportId = TrackingIdGenerator.newTrackingId();
        String status = determineReportStatus(mlResult);

        return Map.ofEntries(
                Map.entry("success", true),
                Map.entry("message", "Crime report submitted successfully and passed all validation checks"),
                Map.entry("reportId", reportId),
                Map.entry("timestamp", LocalDateTime.now().toString()),
                Map.entry("status", status),
                Map.entry("originalDescription", original),
                Map.entry("processedDescription", processed),
                Map.entry("mlClassification", mlResult),
                Map.entry("requiresUrgentAttention", "HIGH".equals(mlResult.get("urgency"))),
                Map.entry("qualityScore", mlResult.get("report_quality")),
                Map.entry("processingNotes", generateProcessingNotes(original, processed, mlResult))
        );
    }


    private Map<String, Object> createSpamResponse(String originalDescription) {
        return Map.of(
                "success", false,
                "message", "Report rejected: Content identified as spam or inappropriate",
                "reportId", "REJECTED_" + System.currentTimeMillis(),
                "timestamp", LocalDateTime.now().toString(),
                "status", "REJECTED",
                "originalDescription", originalDescription,
                "rejectionReason", "SPAM_DETECTED_BY_GEMINI",
                "requiresResubmission", true
        );
    }

    private Map<String, Object> createRejectedResponse(String original, String processed, Map<String, Object> mlResult) {
        String rejectionReason = determineRejectionReason(mlResult);

        return Map.ofEntries(
                Map.entry("success", false),
                Map.entry("message", "Report rejected: " + rejectionReason),
                Map.entry("reportId", "REJECTED_" + System.currentTimeMillis()),
                Map.entry("timestamp", LocalDateTime.now().toString()),
                Map.entry("status", "REJECTED"),
                Map.entry("originalDescription", original),
                Map.entry("processedDescription", processed),
                Map.entry("rejectionReason", rejectionReason),
                Map.entry("mlClassification", mlResult),
                Map.entry("requiresResubmission", true),
                Map.entry("improvementSuggestions", generateImprovementSuggestions(mlResult))
        );
    }

    private Map<String, Object> createErrorResponse(String errorMessage) {
        return Map.of(
                "success", false,
                "message", "Error processing crime report: " + errorMessage,
                "reportId", "ERROR_" + System.currentTimeMillis(),
                "timestamp", LocalDateTime.now().toString(),
                "status", "ERROR",
                "error", errorMessage,
                "requiresRetry", true
        );
    }

    private String determineReportStatus(Map<String, Object> mlResult) {
        if (Boolean.TRUE.equals(mlResult.get("needs_review"))) {
            return "RECEIVED_PENDING_REVIEW";
        } else if ("HIGH".equals(mlResult.get("urgency"))) {
            return "RECEIVED_HIGH_PRIORITY";
        } else if ("MEDIUM".equals(mlResult.get("urgency"))) {
            return "RECEIVED_MEDIUM_PRIORITY";
        } else {
            return "RECEIVED_STANDARD";
        }
    }

    private String determineRejectionReason(Map<String, Object> mlResult) {
        if (Boolean.TRUE.equals(mlResult.get("is_hate_speech"))) {
            return "Contains hate speech or discriminatory language";
        } else if (Boolean.TRUE.equals(mlResult.get("is_toxic"))) {
            return "Contains toxic or inappropriate content";
        } else if (Boolean.TRUE.equals(mlResult.get("is_spam"))) {
            return "Identified as spam or non-genuine report";
        } else {
            return "Content does not meet quality standards for crime reporting";
        }
    }

    private java.util.List<String> generateImprovementSuggestions(Map<String, Object> mlResult) {
        java.util.List<String> suggestions = new java.util.ArrayList<>();

        if (Boolean.TRUE.equals(mlResult.get("is_spam"))) {
            suggestions.add("Provide a more detailed and specific description of the incident");
            suggestions.add("Include relevant facts such as time, date, and specific actions");
            suggestions.add("Avoid casual language or expressions that might be misinterpreted");
        }

        if (Boolean.TRUE.equals(mlResult.get("is_toxic"))) {
            suggestions.add("Use professional and respectful language");
            suggestions.add("Focus on factual information rather than emotional expressions");
            suggestions.add("Remove any inappropriate or offensive content");
        }

        Integer wordCount = (Integer) mlResult.get("word_count");
        if (wordCount != null && wordCount < 10) {
            suggestions.add("Provide more detailed information about the incident");
            suggestions.add("Include specific details about what happened, when, and where");
        }

        return suggestions;
    }

    private String generateProcessingNotes(String original, String processed, Map<String, Object> mlResult) {
        StringBuilder notes = new StringBuilder();

        if (!original.equals(processed)) {
            notes.append("Text was processed by Gemini for language translation and/or grammar correction. ");
        }

        Double confidence = (Double) mlResult.get("confidence");
        if (confidence != null && confidence < 0.7) {
            notes.append("Low confidence classification - may require manual review. ");
        }

        if (Boolean.TRUE.equals(mlResult.get("needs_review"))) {
            notes.append("Flagged for manual review due to content analysis. ");
        }

        return notes.toString().trim();
    }

    public boolean validateCrimeReport(CrimeReportRequest request) {
        if (request.getCategoryId() <= 0) {
            logger.warn("Invalid category ID: {}", request.getCategoryId());
            return false;
        }

        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            logger.warn("Empty description provided");
            return false;
        }

        if (request.getDescription().trim().length() < 10) {
            logger.warn("Description too short: {} characters", request.getDescription().trim().length());
            return false;
        }

        if (request.getPlace() == null || request.getPlace().trim().isEmpty()) {
            logger.warn("Empty place provided");
            return false;
        }

        if (request.getPoliceStation() == null || request.getPoliceStation().trim().isEmpty()) {
            logger.warn("Empty police station provided");
            return false;
        }

        logger.info(" crime report validation passed");
        return true;
    }

    public Map<String, Object> getReportStatus(String reportId) {
        logger.info("Status requested for report ID: {}", reportId);

        String status = determineStatusFromReportId(reportId);

        return Map.of(
                "reportId", reportId,
                "status", status,
                "message", generateStatusMessage(status),
                "submittedAt", LocalDateTime.now().minusHours(1).toString(),
                "lastUpdated", LocalDateTime.now().toString(),
                "estimatedProcessingTime", estimateProcessingTime(status)
        );
    }

    private String determineStatusFromReportId(String reportId) {
        if (reportId.startsWith("REJECTED_")) {
            return "REJECTED";
        } else if (reportId.startsWith("ERROR_")) {
            return "ERROR";
        } else {
            return "RECEIVED";
        }
    }

    private String generateStatusMessage(String status) {
        switch (status) {
            case "RECEIVED_HIGH_PRIORITY":
                return "Your report has been received and marked as high priority";
            case "RECEIVED_PENDING_REVIEW":
                return "Your report is under manual review";
            case "REJECTED":
                return "Your report was rejected due to policy violations";
            case "ERROR":
                return "There was an error processing your report";
            default:
                return "Your report is being processed";
        }
    }

    private String estimateProcessingTime(String status) {
        switch (status) {
            case "RECEIVED_HIGH_PRIORITY":
                return "1-2 hours";
            case "RECEIVED_MEDIUM_PRIORITY":
                return "4-8 hours";
            case "RECEIVED_PENDING_REVIEW":
                return "12-24 hours";
            default:
                return "24-48 hours";
        }
    }

    private boolean isLikelyFalsePositive(Map<String, Object> mlResult, String description) {
        Boolean isSpam = (Boolean) mlResult.getOrDefault("is_spam", false);
        Boolean isHateSpeech = (Boolean) mlResult.getOrDefault("is_hate_speech", false);
        Double spamScore = (Double) mlResult.getOrDefault("spam_score", 0.0);

        Map<String, Object> toxicityAnalysis = (Map<String, Object>) mlResult.get("toxicity_analysis");
        if (toxicityAnalysis == null) return false;

        Double toxicity = (Double) toxicityAnalysis.getOrDefault("toxicity", 0.0);
        Double hateSpeechScore = (Double) toxicityAnalysis.getOrDefault("hate_speech_score", 0.0);

        String[] crimeWords = {"robbery", "theft", "assault", "murder", "gun", "knife", "attack", "violence",
                "stolen", "burglary", "harassment", "threat", "emergency", "help", "police"};
        String[] legitWords = {"report", "incident", "happened", "occurred", "witnessed", "location", "time", "date"};

        String lowerDesc = description.toLowerCase();
        long crimeCount = java.util.Arrays.stream(crimeWords).mapToLong(word ->
                lowerDesc.contains(word) ? 1 : 0).sum();
        long legitCount = java.util.Arrays.stream(legitWords).mapToLong(word ->
                lowerDesc.contains(word) ? 1 : 0).sum();

        boolean hasGoodStructure = description.split("\\s+").length >= 8 &&
                (crimeCount >= 1 || legitCount >= 1);

        if (isSpam && spamScore < 0.3 && hasGoodStructure) {
            logger.info("Overriding spam classification - likely false positive due to crime content");
            return true;
        }

        if (isHateSpeech && hateSpeechScore > 0.7 && toxicity < 0.2 && crimeCount >= 1) {
            logger.info("Overriding hate speech classification - likely false positive due to crime vocabulary");
            return true;
        }

        return false;
    }

    private Map<String, Object> applyValidationOverrides(Map<String, Object> mlResult, String description) {
        if (isLikelyFalsePositive(mlResult, description)) {
            Map<String, Object> correctedResult = new java.util.HashMap<>(mlResult);

            Double spamScore = (Double) mlResult.getOrDefault("spam_score", 0.0);
            if (spamScore < 0.3) {
                correctedResult.put("is_spam", false);
            }

            Map<String, Object> toxicityAnalysis = (Map<String, Object>) mlResult.get("toxicity_analysis");
            if (toxicityAnalysis != null) {
                Double toxicity = (Double) toxicityAnalysis.getOrDefault("toxicity", 0.0);
                if (toxicity < 0.2) {
                    correctedResult.put("is_hate_speech", false);
                }
            }

            String currentQuality = (String) mlResult.getOrDefault("report_quality", "LOW");
            if ("LOW".equals(currentQuality) && description.split("\\s+").length >= 8) {
                correctedResult.put("report_quality", "MEDIUM");
            }

            logger.info("Applied validation overrides to reduce false positives");
            return correctedResult;
        }

        return mlResult;
    }
}