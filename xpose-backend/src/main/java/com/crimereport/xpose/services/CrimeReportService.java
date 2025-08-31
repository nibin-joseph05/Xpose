package com.crimereport.xpose.services;

import com.crimereport.xpose.dto.CrimeReportRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;

@Service
public class CrimeReportService {

    @Autowired
    private GeminiService geminiService;

    private static final Logger logger = LoggerFactory.getLogger(CrimeReportService.class);

    public Map<String, Object> submitCrimeReport(CrimeReportRequest request) {
        try {
            logger.info("=== CRIME REPORT RECEIVED ===");

            String originalDescription = request.getDescription();
            String translatedDescription = originalDescription;

            if (!isProbablyEnglish(originalDescription)) {
                translatedDescription = geminiService.translateToEnglish(originalDescription);
                logger.info("Translated Description: {}", translatedDescription);
            } else {
                logger.info("Description already in English, skipping translation.");
            }

            logger.info("Timestamp: {}", LocalDateTime.now());
            logger.info("Category ID: {}", request.getCategoryId());
            logger.info("Category Name: {}", request.getCategoryName());
            logger.info("Crime Type: {}", request.getCrimeType());
            logger.info("Original Description: {}", originalDescription);
            logger.info("Final Description (English): {}", translatedDescription);
            logger.info("Place: {}", request.getPlace());
            logger.info("State: {}", request.getState());
            logger.info("District: {}", request.getDistrict());
            logger.info("Police Station: {}", request.getPoliceStation());
            logger.info("Files Attached: {}", request.getFiles() != null ? request.getFiles().size() : 0);

            if (request.getFiles() != null && !request.getFiles().isEmpty()) {
                logger.info("File Names: {}", String.join(", ", request.getFiles()));
            }

            logger.info("=== END CRIME REPORT ===");

            // Simulate processing - in real implementation, you would:
            // 1. Save to database (store both original + translated description)
            // 2. Generate unique report ID
            // 3. Send notifications
            // 4. Process file uploads
            // 5. Integrate with police systems

            // For now, just return success response
            return Map.of(
                    "success", true,
                    "message", "Crime report submitted successfully",
                    "reportId", "CR" + System.currentTimeMillis(),
                    "timestamp", LocalDateTime.now().toString(),
                    "status", "RECEIVED",
                    "originalDescription", originalDescription,
                    "translatedDescription", translatedDescription
            );

        } catch (Exception e) {
            logger.error("Error processing crime report submission: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to submit crime report: " + e.getMessage());
        }
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

        if (request.getPlace() == null || request.getPlace().trim().isEmpty()) {
            logger.warn("Empty place provided");
            return false;
        }

        if (request.getPoliceStation() == null || request.getPoliceStation().trim().isEmpty()) {
            logger.warn("Empty police station provided");
            return false;
        }

        logger.info("Crime report validation passed");
        return true;
    }

    public Map<String, Object> getReportStatus(String reportId) {
        logger.info("Status requested for report ID: {}", reportId);

        return Map.of(
                "reportId", reportId,
                "status", "RECEIVED",
                "message", "Your report is being processed",
                "submittedAt", LocalDateTime.now().minusHours(1).toString()
        );
    }

    /**
     * Utility function to check if text is probably English.
     * Very simple heuristic: if most characters are A-Z, assume English.
     */
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

        // If 70%+ letters are English, assume it's English
        return totalChars == 0 || (englishChars * 100 / totalChars) > 70;
    }
}
