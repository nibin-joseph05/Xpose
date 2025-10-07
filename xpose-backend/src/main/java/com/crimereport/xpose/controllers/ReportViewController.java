package com.crimereport.xpose.controllers;

import com.crimereport.xpose.dto.CrimeReportDetail;
import com.crimereport.xpose.dto.CrimeReportList;
import com.crimereport.xpose.services.CrimeReportService;
import com.crimereport.xpose.services.ReportViewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportViewController {

    private static final Logger logger = LoggerFactory.getLogger(ReportViewController.class);

    @Autowired
    private ReportViewService reportViewService;

    @Autowired
    private CrimeReportService crimeReportService;

    @GetMapping
    public ResponseEntity<?> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            logger.info("Fetching reports: page={}, size={}", page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<CrimeReportList> reportPage = reportViewService.getAllReports(pageable);
            return ResponseEntity.ok(Map.of(
                    "reports", reportPage.getContent(),
                    "currentPage", reportPage.getNumber(),
                    "totalItems", reportPage.getTotalElements(),
                    "totalPages", reportPage.getTotalPages()
            ));
        } catch (Exception e) {
            logger.error("Error fetching reports: {}", e.getMessage(), e);
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

    @PostMapping("/update-review-status")
    public ResponseEntity<?> updateReviewStatus(@RequestBody UpdateReviewStatusRequest request) {
        try {
            logger.info("Updating review status for report ID: {}", request.getReportId());
            Map<String, Object> result = crimeReportService.updateReviewStatus(
                    request.getReportId(),
                    request.getReviewStatus(),
                    request.getReviewedById(),
                    request.getRejectionReason()
            );
            if (!(Boolean) result.get("success")) {
                logger.warn("Failed to update review status for report ID: {}", request.getReportId());
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error updating review status for report ID {}: {}", request.getReportId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", "Failed to update review status",
                            "error", "INTERNAL_ERROR"
                    )
            );
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