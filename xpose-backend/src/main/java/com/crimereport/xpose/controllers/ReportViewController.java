package com.crimereport.xpose.controllers;

import com.crimereport.xpose.dto.CrimeReportDetail;
import com.crimereport.xpose.dto.CrimeReportList;
import com.crimereport.xpose.dto.UpdateAdminStatusRequest;
import com.crimereport.xpose.dto.UpdatePoliceStatusRequest;
import com.crimereport.xpose.models.CrimeReport;
import com.crimereport.xpose.models.PoliceStation;
import com.crimereport.xpose.repository.CrimeReportRepository;
import com.crimereport.xpose.repository.PoliceStationRepository;
import com.crimereport.xpose.services.CrimeReportService;
import com.crimereport.xpose.services.ReportViewService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportViewController {

    private static final Logger logger = LoggerFactory.getLogger(ReportViewController.class);

    @Autowired
    private ReportViewService reportViewService;

    @Autowired
    private CrimeReportService crimeReportService;

    @Autowired
    private PoliceStationRepository policeStationRepository;

    @Autowired
    private CrimeReportRepository crimeReportRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<?> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String stationId,
            @RequestParam(required = false) String officerId) {
        try {
            logger.info("📥 Fetching reports: page={}, size={}, stationId={}, officerId={}", page, size, stationId, officerId);

            String stationName = null;
            if (stationId != null && !stationId.trim().isEmpty()) {
                try {
                    Long stationIdLong = Long.parseLong(stationId);
                    Optional<PoliceStation> stationOpt = policeStationRepository.findById(stationIdLong);
                    if (stationOpt.isPresent()) {
                        stationName = stationOpt.get().getName();
                        logger.info("🏢 Converted station ID {} to station name: {}", stationId, stationName);
                    } else {
                        logger.warn("⚠️ Station ID {} not found", stationId);
                    }
                } catch (NumberFormatException e) {
                    stationName = stationId;
                    logger.info("📝 Using stationId as station name: {}", stationName);
                }
            }

            Long officerIdLong = null;
            if (officerId != null && !officerId.trim().isEmpty()) {
                try {
                    officerIdLong = Long.parseLong(officerId);
                    logger.info("👮 Parsed officer ID: {} (Type: Long)", officerIdLong);
                } catch (NumberFormatException e) {
                    logger.error("❌ Invalid officer ID format: {}", officerId);
                    return ResponseEntity.badRequest().body(Map.of(
                            "success", false,
                            "message", "Invalid officer ID format",
                            "error", "INVALID_OFFICER_ID"
                    ));
                }
            }

            logger.info("🎯 Final query parameters: stationName={}, officerIdLong={}", stationName, officerIdLong);

            Pageable pageable = PageRequest.of(page, size);
            Page<CrimeReportList> reportPage = reportViewService.getAllReports(pageable, stationName, officerIdLong);

            logger.info("✅ Found {} reports for stationName={}, officerId={}",
                    reportPage.getTotalElements(), stationName, officerIdLong);

            return ResponseEntity.ok(Map.of(
                    "reports", reportPage.getContent(),
                    "currentPage", reportPage.getNumber(),
                    "totalItems", reportPage.getTotalElements(),
                    "totalPages", reportPage.getTotalPages()
            ));
        } catch (Exception e) {
            logger.error("❌ Error fetching reports: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", "Failed to fetch reports",
                            "error", "INTERNAL_ERROR"
                    )
            );
        }
    }

    @GetMapping("/chain")
    public ResponseEntity<?> getBlockchainChain() {
        try {
            logger.info("Fetching blockchain chain");
            List<Map<String, Object>> chain = reportViewService.getBlockchainChain();
            return ResponseEntity.ok(chain);
        } catch (Exception e) {
            logger.error("Error fetching blockchain chain: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", "Failed to fetch blockchain chain",
                            "error", "INTERNAL_ERROR"
                    )
            );
        }
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<?> getReportDetails(@PathVariable String reportId) {
        try {
            if (!reportId.matches("[A-Za-z0-9\\-]+")) {
                logger.warn("Invalid report ID format: {}", reportId);
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "message", "Invalid report ID format",
                                "error", "INVALID_REPORT_ID"
                        )
                );
            }
            logger.info("Fetching details for report ID: {}", reportId);
            CrimeReportDetail report = reportViewService.getReportDetails(reportId);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            logger.warn("Report not found: {}", reportId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of(
                            "success", false,
                            "message", "Report not found: " + reportId,
                            "error", "NOT_FOUND"
                    )
            );
        } catch (Exception e) {
            logger.error("Error fetching report details for ID {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", "Failed to fetch report details",
                            "error", "INTERNAL_ERROR"
                    )
            );
        }
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assignReport(@RequestBody AssignReportRequest request) {
        try {
            reportViewService.assignReportToOfficer(request.getReportId(), request.getOfficerId());
            return ResponseEntity.ok(Map.of("message", "Report assigned successfully"));
        } catch (Exception e) {
            logger.error("Error assigning report ID {}: {}", request.getReportId(), e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/auto-assign")
    public ResponseEntity<?> autoAssignReport(@RequestBody AutoAssignReportRequest request) {
        try {
            Long officerId = reportViewService.autoAssignReport(request.getReportId());
            return ResponseEntity.ok(Map.of("message", "Report auto-assigned successfully", "officerId", officerId));
        } catch (Exception e) {
            logger.error("Error auto-assigning report ID {}: {}", request.getReportId(), e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/update-admin-status")
    public ResponseEntity<?> updateAdminStatus(@RequestBody UpdateAdminStatusRequest request) {
        try {
            logger.info("Updating admin status for report ID: {}", request.getReportId());
            Map<String, Object> result = crimeReportService.updateAdminStatus(
                    request.getReportId(),
                    request.getAdminStatus(),
                    request.getReviewedById(),
                    request.getRejectionReason()
            );

            if ((Boolean) result.get("success")) {
                Map<String, Object> update = Map.of(
                        "reportId", request.getReportId(),
                        "updateType", "ADMIN_STATUS_CHANGED",
                        "adminStatus", request.getAdminStatus(),
                        "timestamp", System.currentTimeMillis()
                );

                messagingTemplate.convertAndSend("/topic/report.updates", update);
                logger.info("Broadcasted admin status update for report: {}", request.getReportId());
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error updating admin status for report ID {}: {}", request.getReportId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", "Failed to update admin status",
                            "error", "INTERNAL_ERROR"
                    )
            );
        }
    }

    @PostMapping("/update-police-status")
    public ResponseEntity<?> updatePoliceStatus(@RequestBody UpdatePoliceStatusRequest request) {
        try {
            logger.info("Updating police status for report ID: {}", request.getReportId());

            if (request.getReportId() == null || request.getReportId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Report ID is required"
                ));
            }

            if (request.getPoliceStatus() == null || request.getPoliceStatus().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Police status is required"
                ));
            }

            Map<String, Object> result = crimeReportService.updatePoliceStatus(
                    request.getReportId(),
                    request.getPoliceStatus(),
                    request.getOfficerId(),
                    request.getFeedback(),
                    request.getActionProof()
            );

            if (!(Boolean) result.get("success")) {
                logger.warn("Failed to update police status for report ID: {}", request.getReportId());
                return ResponseEntity.badRequest().body(result);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error updating police status for report ID {}: {}", request.getReportId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", "Failed to update police status",
                            "error", "INTERNAL_ERROR"
                    )
            );
        }
    }

    @PostMapping("/upload-police-proof")
    public ResponseEntity<?> uploadPoliceProof(@RequestParam("file") MultipartFile file,
                                               @RequestParam("reportId") String reportId) {
        try {
            Path uploadPath = Paths.get(uploadDir, "police-proofs");
            Files.createDirectories(uploadPath);

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "/uploads/police-proofs/" + fileName;

            Optional<CrimeReport> reportOpt = crimeReportRepository.findById(reportId);
            if (reportOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Report not found"));
            }

            CrimeReport report = reportOpt.get();

            List<String> proofFiles = new ArrayList<>();
            String currentProofJson = report.getPoliceActionProof();

            if (currentProofJson != null && !currentProofJson.isEmpty()) {
                proofFiles = objectMapper.readValue(currentProofJson, new TypeReference<List<String>>() {});
            }

            proofFiles.add(relativePath);

            report.setPoliceActionProof(objectMapper.writeValueAsString(proofFiles));
            crimeReportRepository.save(report);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Police proof uploaded successfully",
                    "filePath", relativePath
            ));

        } catch (IOException e) {
            logger.error("Error uploading police proof for report {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "File upload failed"));
        } catch (Exception e) {
            logger.error("Unexpected error uploading police proof: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Unexpected error occurred"));
        }
    }
}

class AssignReportRequest {
    private String reportId;
    private Long officerId;

    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }
    public Long getOfficerId() { return officerId; }
    public void setOfficerId(Long officerId) { this.officerId = officerId; }
}

class AutoAssignReportRequest {
    private String reportId;

    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }
}

class UpdateReviewStatusRequest {
    private String reportId;
    private String reviewStatus;
    private Long reviewedById;
    private String rejectionReason;

    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }
    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }
    public Long getReviewedById() { return reviewedById; }
    public void setReviewedById(Long reviewedById) { this.reviewedById = reviewedById; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}