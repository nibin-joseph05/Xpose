
package com.crimereport.xpose.services;

import com.crimereport.xpose.dto.CrimeReportRequest;
import com.crimereport.xpose.models.CrimeReport;
import com.crimereport.xpose.repository.CrimeReportRepository;
import com.crimereport.xpose.util.TrackingIdGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class CrimeReportService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private MLService mlService;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private CrimeReportRepository crimeReportRepository;

    private static final Logger logger = LoggerFactory.getLogger(CrimeReportService.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> submitCrimeReport(CrimeReportRequest request) {
        try {
            logger.info("===  CRIME REPORT PROCESSING STARTED ===");
            String originalDescription = request.getDescription();
            logger.info("Original Description: {}", originalDescription);

            logger.info("=== PHASE 1: PRE-PROCESSING VALIDATION ===");
            String textForMLAnalysis = originalDescription;
            boolean isEnglish = geminiService.isTextInEnglish(originalDescription);

            if (!isEnglish) {
                logger.info("Text not in English, translating for ML analysis only...");
                textForMLAnalysis = geminiService.translateToEnglish(originalDescription);
                logger.info("Translated for ML analysis: {}", textForMLAnalysis);
            }

            Map<String, Object> preProcessingMLResult = mlService.classifyDescription(textForMLAnalysis);
            logger.info("=== PRE-PROCESSING ML RESULTS ===");
            logMLResults(preProcessingMLResult);

            boolean isPreProcessingSpamOrToxic = (Boolean) preProcessingMLResult.getOrDefault("is_spam", false) ||
                    (Boolean) preProcessingMLResult.getOrDefault("is_toxic", false) ||
                    (Boolean) preProcessingMLResult.getOrDefault("is_hate_speech", false);

            if (isPreProcessingSpamOrToxic) {
                logger.warn("Report REJECTED in pre-processing phase due to spam/toxic/hate speech content");
                return createRejectedResponse(originalDescription, originalDescription, preProcessingMLResult, "PRE_PROCESSING", request);
            }

            logger.info("=== PHASE 2: GEMINI PROCESSING FOR READABILITY ===");
            String processedDescription = processDescriptionForReadability(originalDescription);
            logger.info("Processed Description: {}", processedDescription);

            if ("SPAM_DETECTED".equals(processedDescription)) {
                logger.warn("Gemini detected additional spam patterns");
                return createSpamResponse(originalDescription, request, preProcessingMLResult);
            }

            logger.info("=== PHASE 3: POST-PROCESSING QUALITY CHECK ===");
            Map<String, Object> postProcessingMLResult = mlService.classifyDescription(processedDescription);

            Map<String, Object> finalResult = combineMlResults(preProcessingMLResult, postProcessingMLResult);
            Map<String, Object> validatedResult = applyValidationOverrides(finalResult, originalDescription, processedDescription);

            logger.info("===  FINAL ML CLASSIFICATION RESULTS ===");
            logMLResults(validatedResult);

            boolean isFinalSpamOrToxic = (Boolean) validatedResult.getOrDefault("is_spam", false) ||
                    (Boolean) validatedResult.getOrDefault("is_toxic", false) ||
                    (Boolean) validatedResult.getOrDefault("is_hate_speech", false);

            if (isFinalSpamOrToxic) {
                logger.warn("Report flagged as spam/toxic/hate speech in final validation");
                return createRejectedResponse(originalDescription, processedDescription, validatedResult, "FINAL_VALIDATION", request);
            }

            logReportDetails(request, originalDescription, processedDescription, validatedResult);

            return createSuccessResponse(request, originalDescription, processedDescription, validatedResult);

        } catch (Exception e) {
            logger.error("Error processing crime report submission: {}", e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }
    }

    public CompletableFuture<Map<String, Object>> submitCrimeReportAsync(CrimeReportRequest request) {
        return CompletableFuture.supplyAsync(() -> submitCrimeReport(request));
    }

    private String processDescriptionForReadability(String originalDescription) {
        try {
            boolean isEnglish = geminiService.isTextInEnglish(originalDescription);

            if (!isEnglish) {
                logger.info("Text not in English, translating for readability...");
                String translated = geminiService.translateToEnglish(originalDescription);
                return geminiService.improveReadabilityOnly(translated);
            } else {
                logger.info("Text is in English, improving readability only...");
                return geminiService.improveReadabilityOnly(originalDescription);
            }
        } catch (Exception e) {
            logger.error("Error processing description with Gemini: {}", e.getMessage());
            return originalDescription;
        }
    }

    private Map<String, Object> combineMlResults(Map<String, Object> preResult, Map<String, Object> postResult) {
        boolean isSpam = (Boolean) preResult.getOrDefault("is_spam", false) ||
                (Boolean) postResult.getOrDefault("is_spam", false);
        boolean isHateSpeech = (Boolean) preResult.getOrDefault("is_hate_speech", false) ||
                (Boolean) postResult.getOrDefault("is_hate_speech", false);
        boolean isToxic = (Boolean) preResult.getOrDefault("is_toxic", false) ||
                (Boolean) postResult.getOrDefault("is_toxic", false);
        boolean needsReview = (Boolean) preResult.getOrDefault("needs_review", false) ||
                (Boolean) postResult.getOrDefault("needs_review", false);

        String preUrgency = (String) preResult.getOrDefault("urgency", "LOW");
        String postUrgency = (String) postResult.getOrDefault("urgency", "LOW");
        String finalUrgency = getHigherUrgency(preUrgency, postUrgency);

        String reportQuality = (String) postResult.getOrDefault("report_quality", "LOW");

        Double preConfidence = (Double) preResult.getOrDefault("confidence", 0.0);
        Double postConfidence = (Double) postResult.getOrDefault("confidence", 0.0);
        Double finalConfidence = Math.max(preConfidence, postConfidence);

        Integer wordCount = (Integer) postResult.getOrDefault("word_count", 0);
        Integer charCount = (Integer) postResult.getOrDefault("char_count", 0);

        Map<String, Object> toxicityAnalysis = (Map<String, Object>) preResult.getOrDefault("toxicity_analysis", postResult.get("toxicity_analysis"));

        Object shapExplanation = postResult.get("shap_explanation");

        return Map.ofEntries(
                Map.entry("is_spam", isSpam),
                Map.entry("is_hate_speech", isHateSpeech),
                Map.entry("is_toxic", isToxic),
                Map.entry("urgency", finalUrgency),
                Map.entry("confidence", finalConfidence),
                Map.entry("spam_score", Math.max((Double) preResult.getOrDefault("spam_score", 0.0),
                        (Double) postResult.getOrDefault("spam_score", 0.0))),
                Map.entry("report_quality", reportQuality),
                Map.entry("toxicity_analysis", toxicityAnalysis),
                Map.entry("word_count", wordCount),
                Map.entry("char_count", charCount),
                Map.entry("needs_review", needsReview),
                Map.entry("shap_explanation", shapExplanation),
                Map.entry("pre_processing_flags", Map.of(
                        "spam", preResult.getOrDefault("is_spam", false),
                        "toxic", preResult.getOrDefault("is_toxic", false),
                        "hate_speech", preResult.getOrDefault("is_hate_speech", false)
                )),
                Map.entry("post_processing_flags", Map.of(
                        "spam", postResult.getOrDefault("is_spam", false),
                        "toxic", postResult.getOrDefault("is_toxic", false),
                        "hate_speech", postResult.getOrDefault("is_hate_speech", false)
                ))
        );
    }

    private String getHigherUrgency(String urgency1, String urgency2) {
        if ("HIGH".equals(urgency1) || "HIGH".equals(urgency2)) return "HIGH";
        if ("MEDIUM".equals(urgency1) || "MEDIUM".equals(urgency2)) return "MEDIUM";
        return "LOW";
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

    private Map<String, Object> createSuccessResponse(CrimeReportRequest request,
                                                      String original,
                                                      String processed,
                                                      Map<String, Object> mlResult) {
        String reportId = TrackingIdGenerator.newTrackingId();
        String status = determineReportStatus(mlResult);

        CrimeReport report = new CrimeReport();
        report.setCrimeCategoryId((long) request.getCategoryId());
        report.setOriginalDescription(original);
        report.setTranslatedDescription(mlResult.getOrDefault("translated_description", "").toString());
        report.setReadabilityEnhancedDescription(processed);
        report.setAttachments(request.getFiles() != null ? convertFilesToJson(request.getFiles()) : null);
        report.setAddress(request.getPlace());
        report.setCity(request.getDistrict());
        report.setState(request.getState());
        report.setCountry("India");
        report.setSubmittedAt(LocalDateTime.now());
        report.setSpam((Boolean) mlResult.getOrDefault("is_spam", false));
        report.setToxic((Boolean) mlResult.getOrDefault("is_toxic", false));
        report.setHateSpeech((Boolean) mlResult.getOrDefault("is_hate_speech", false));
        report.setUrgencyLevel(CrimeReport.UrgencyLevel.valueOf(mlResult.getOrDefault("urgency", "LOW").toString()));
        report.setConfidenceScore((Double) mlResult.getOrDefault("confidence", 0.0));
        report.setNeedsReview((Boolean) mlResult.getOrDefault("needs_review", false));
        report.setSpamScore((Double) mlResult.getOrDefault("spam_score", 0.0));
        report.setToxicityScores(convertMapToJson((Map<String, Object>) mlResult.get("toxicity_analysis")));
        report.setShapExplanation(convertMapToJson((Map<String, Object>) mlResult.get("shap_explanation")));
        report.setReportQuality(CrimeReport.ReportQuality.valueOf(mlResult.getOrDefault("report_quality", "LOW").toString()));
        report.setWordCount((Integer) mlResult.getOrDefault("word_count", 0));
        report.setCharCount((Integer) mlResult.getOrDefault("char_count", 0));
        report.setProcessingPhase(CrimeReport.ProcessingPhase.FINALIZED);
        report.setStatus(CrimeReport.ReportStatus.ACCEPTED);
        report.setBlockchainHash(null);
        report.setBlockchainTxId(null);
        report.setBlockchainTimestamp(null);

        try {
            crimeReportRepository.save(report);
            logger.info("Crime report saved to PostgreSQL with ID: {}", report.getId());
        } catch (Exception e) {
            logger.error("Failed to save crime report to PostgreSQL: {}", e.getMessage());
            return createErrorResponse("Failed to save report: " + e.getMessage());
        }

        Map<String, Object> blockchainResult = blockchainService.sendReportToBlockchain(request, reportId);

        if (blockchainResult.getOrDefault("success", false).equals(Boolean.TRUE)) {
            report.setBlockchainHash((String) blockchainResult.get("hash"));
            report.setBlockchainTxId((String) blockchainResult.get("txId"));
            report.setBlockchainTimestamp(LocalDateTime.now());
            crimeReportRepository.save(report);
            logger.info("Blockchain info saved for report ID: {}", reportId);
        } else {
            logger.warn("Blockchain submission failed for report ID: {}", reportId);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Crime report submitted successfully and saved");
        response.put("reportId", reportId);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", status);
        response.put("originalDescription", original);
        response.put("processedDescription", processed);
        response.put("mlClassification", mlResult);
        response.put("requiresUrgentAttention", "HIGH".equals(mlResult.get("urgency")));
        response.put("qualityScore", mlResult.get("report_quality"));
        response.put("processingNotes", generateProcessingNotes(original, processed, mlResult));

        return response;
    }

    private Map<String, Object> createSpamResponse(String originalDescription, CrimeReportRequest request, Map<String, Object> mlResult) {
        String reportId = TrackingIdGenerator.newRejectedId();

        CrimeReport report = new CrimeReport();
        report.setCrimeCategoryId((long) request.getCategoryId());
        report.setOriginalDescription(originalDescription);
        report.setAttachments(request.getFiles() != null ? convertFilesToJson(request.getFiles()) : null);
        report.setAddress(request.getPlace());
        report.setCity(request.getDistrict());
        report.setState(request.getState());
        report.setCountry("India");
        report.setSubmittedAt(LocalDateTime.now());
        report.setSpam(true);
        report.setToxic(false);
        report.setHateSpeech(false);
        report.setUrgencyLevel(CrimeReport.UrgencyLevel.LOW);
        report.setConfidenceScore((Double) mlResult.getOrDefault("confidence", 0.0));
        report.setNeedsReview(false);
        report.setSpamScore((Double) mlResult.getOrDefault("spam_score", 0.0));
        report.setToxicityScores(convertMapToJson((Map<String, Object>) mlResult.get("toxicity_analysis")));
        report.setShapExplanation(convertMapToJson((Map<String, Object>) mlResult.get("shap_explanation")));
        report.setReportQuality(CrimeReport.ReportQuality.LOW);
        report.setWordCount((Integer) mlResult.getOrDefault("word_count", 0));
        report.setCharCount((Integer) mlResult.getOrDefault("char_count", 0));
        report.setProcessingPhase(CrimeReport.ProcessingPhase.GEMINI_ENRICHED);
        report.setStatus(CrimeReport.ReportStatus.REJECTED);
        report.setRejectionReason("SPAM_DETECTED_BY_GEMINI");

        try {
            crimeReportRepository.save(report);
            logger.info("Spam report saved to PostgreSQL with ID: {}", report.getId());
        } catch (Exception e) {
            logger.error("Failed to save spam report: {}", e.getMessage());
        }

        return Map.of(
                "success", false,
                "message", "Report rejected: Content identified as spam or inappropriate",
                "reportId", reportId,
                "timestamp", LocalDateTime.now().toString(),
                "status", "REJECTED",
                "originalDescription", originalDescription,
                "rejectionReason", "SPAM_DETECTED_BY_GEMINI",
                "rejectionPhase", "GEMINI_PROCESSING",
                "requiresResubmission", true
        );
    }


    private Map<String, Object> createRejectedResponse(String original, String processed,
                                                       Map<String, Object> mlResult,
                                                       String rejectionPhase,
                                                       CrimeReportRequest request) {
        String reportId = TrackingIdGenerator.newRejectedId();
        String rejectionReason = determineRejectionReason(mlResult);

        CrimeReport report = new CrimeReport();
        report.setCrimeCategoryId((long) request.getCategoryId());
        report.setOriginalDescription(original);
        report.setTranslatedDescription(mlResult.getOrDefault("translated_description", "").toString());
        report.setReadabilityEnhancedDescription(processed);
        report.setAttachments(request.getFiles() != null ? convertFilesToJson(request.getFiles()) : null);
        report.setAddress(request.getPlace());
        report.setCity(request.getDistrict());
        report.setState(request.getState());
        report.setCountry("India");
        report.setSubmittedAt(LocalDateTime.now());
        report.setSpam((Boolean) mlResult.getOrDefault("is_spam", false));
        report.setToxic((Boolean) mlResult.getOrDefault("is_toxic", false));
        report.setHateSpeech((Boolean) mlResult.getOrDefault("is_hate_speech", false));
        report.setUrgencyLevel(CrimeReport.UrgencyLevel.valueOf(mlResult.getOrDefault("urgency", "LOW").toString()));
        report.setConfidenceScore((Double) mlResult.getOrDefault("confidence", 0.0));
        report.setNeedsReview((Boolean) mlResult.getOrDefault("needs_review", false));
        report.setSpamScore((Double) mlResult.getOrDefault("spam_score", 0.0));
        report.setToxicityScores(convertMapToJson((Map<String, Object>) mlResult.get("toxicity_analysis")));
        report.setShapExplanation(convertMapToJson((Map<String, Object>) mlResult.get("shap_explanation")));
        report.setReportQuality(CrimeReport.ReportQuality.valueOf(mlResult.getOrDefault("report_quality", "LOW").toString()));
        report.setWordCount((Integer) mlResult.getOrDefault("word_count", 0));
        report.setCharCount((Integer) mlResult.getOrDefault("char_count", 0));
        report.setProcessingPhase(CrimeReport.ProcessingPhase.FINALIZED);
        report.setStatus(CrimeReport.ReportStatus.REJECTED);
        report.setRejectionReason(rejectionReason);

        try {
            crimeReportRepository.save(report);
            logger.info("Rejected report saved to PostgreSQL with ID: {}", report.getId());
        } catch (Exception e) {
            logger.error("Failed to save rejected report: {}", e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Report rejected: " + rejectionReason);
        response.put("reportId", reportId);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "REJECTED");
        response.put("originalDescription", original);
        response.put("processedDescription", processed);
        response.put("rejectionReason", rejectionReason);
        response.put("rejectionPhase", rejectionPhase);
        response.put("mlClassification", mlResult);
        response.put("requiresResubmission", true);
        response.put("improvementSuggestions", generateImprovementSuggestions(mlResult));

        return response;
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
            notes.append("Text was processed by Gemini for language translation and/or readability improvement. ");
        }

        Double confidence = (Double) mlResult.get("confidence");
        if (confidence != null && confidence < 0.7) {
            notes.append("Low confidence classification - may require manual review. ");
        }

        if (Boolean.TRUE.equals(mlResult.get("needs_review"))) {
            notes.append("Flagged for manual review due to content analysis. ");
        }

        Map<String, Object> preFlags = (Map<String, Object>) mlResult.get("pre_processing_flags");
        Map<String, Object> postFlags = (Map<String, Object>) mlResult.get("post_processing_flags");

        if (preFlags != null && postFlags != null) {
            boolean preHadIssues = (Boolean) preFlags.getOrDefault("spam", false) ||
                    (Boolean) preFlags.getOrDefault("toxic", false) ||
                    (Boolean) preFlags.getOrDefault("hate_speech", false);

            if (preHadIssues) {
                notes.append("Dual-pass validation detected potential issues in original content. ");
            }
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

    private Map<String, Object> applyValidationOverrides(Map<String, Object> mlResult, String originalText, String processedText) {
        if (isLikelyFalsePositive(mlResult, processedText)) {
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
            if ("LOW".equals(currentQuality) && processedText.split("\\s+").length >= 8) {
                correctedResult.put("report_quality", "MEDIUM");
            }

            logger.info("Applied validation overrides to reduce false positives");
            return correctedResult;
        }

        return mlResult;
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

    private String convertFilesToJson(java.util.List<String> files) {
        if (files == null || files.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(files);
        } catch (JsonProcessingException e) {
            logger.error("Failed to convert attachments to JSON: {}", e.getMessage());
            return "[]";
        }
    }

    private String convertMapToJson(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return "{}";
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            logger.error("Failed to convert map to JSON: {}", e.getMessage());
            return "{}";
        }
    }

}