package com.crimereport.xpose.controllers;

import com.crimereport.xpose.dto.CrimeReportRequest;
import com.crimereport.xpose.services.CrimeReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/crime-reports")
@CrossOrigin(origins = "*")
public class CrimeReportController {

    private static final Logger logger = LoggerFactory.getLogger(CrimeReportController.class);

    @Autowired
    private CrimeReportService crimeReportService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitCrimeReport(@RequestBody CrimeReportRequest request) {
        try {
            logger.info("Received crime report submission request");
            logger.debug("Request details: {}", request.toString());

            // Validate the request
            if (!crimeReportService.validateCrimeReport(request)) {
                logger.warn("Crime report validation failed");
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "message", "Invalid crime report data. Please check all required fields.",
                                "error", "VALIDATION_FAILED"
                        )
                );
            }

            // Process the crime report
            Map<String, Object> result = crimeReportService.submitCrimeReport(request);
            logger.info("Crime report submitted successfully with ID: {}", result.get("reportId"));

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            logger.warn("Bad request for crime report submission: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage(),
                            "error", "BAD_REQUEST"
                    )
            );
        } catch (Exception e) {
            logger.error("Internal error during crime report submission: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", "Internal server error occurred while processing your report",
                            "error", "INTERNAL_ERROR"
                    )
            );
        }
    }

    @GetMapping("/status/{reportId}")
    public ResponseEntity<?> getReportStatus(@PathVariable String reportId) {
        try {
            logger.info("Status request for report ID: {}", reportId);

            if (reportId == null || reportId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "message", "Report ID is required",
                                "error", "MISSING_REPORT_ID"
                        )
                );
            }

            Map<String, Object> status = crimeReportService.getReportStatus(reportId);
            return ResponseEntity.ok(status);

        } catch (Exception e) {
            logger.error("Error fetching report status for ID {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", "Error fetching report status",
                            "error", "INTERNAL_ERROR"
                    )
            );
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(
                Map.of(
                        "service", "Crime Report API",
                        "status", "UP",
                        "timestamp", System.currentTimeMillis()
                )
        );
    }
}