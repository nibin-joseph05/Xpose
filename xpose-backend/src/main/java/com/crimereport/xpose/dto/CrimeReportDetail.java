package com.crimereport.xpose.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class CrimeReportDetail {
    private String reportId;
    private String crimeType;
    private Integer crimeTypeId;
    private Integer categoryId;
    private String categoryName;
    private String originalDescription;
    private String processedDescription;
    private String address;
    private String city;
    private String state;
    private String policeStation;
    private String status;
    private String urgency;
    private LocalDateTime submittedAt;
    private Double confidenceScore;
    private Double spamScore;
    private Map<String, Object> toxicityScores;
    private Map<String, Object> shapExplanation;
    private String reportQuality;

    private String blockchainHash;
    private LocalDateTime blockchainTimestamp;
    private String blockchainTxId;
    private String rawBlockchainData;

    private Double latitude;
    private Double longitude;
    private Long assignedOfficerId;
    private String assignedOfficerName;

    private String adminStatus;
    private String policeStatus;
    private String policeFeedback;
    private List<String> policeActionProof;
    private LocalDateTime actionTakenAt;
    private Long actionTakenBy;
    private String actionTakenByName;
    private Long reviewedById;
    private String reviewedByName;

    public String getReportId() {
        return reportId;
    }

    public String getCrimeType() {
        return crimeType;
    }

    public Integer getCrimeTypeId() {
        return crimeTypeId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getOriginalDescription() {
        return originalDescription;
    }

    public String getProcessedDescription() {
        return processedDescription;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPoliceStation() {
        return policeStation;
    }

    public String getStatus() {
        return status;
    }

    public String getUrgency() {
        return urgency;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public Double getSpamScore() {
        return spamScore;
    }

    public Map<String, Object> getToxicityScores() {
        return toxicityScores;
    }

    public Map<String, Object> getShapExplanation() {
        return shapExplanation;
    }

    public String getReportQuality() {
        return reportQuality;
    }

    public String getBlockchainHash() {
        return blockchainHash;
    }

    public LocalDateTime getBlockchainTimestamp() {
        return blockchainTimestamp;
    }

    public String getBlockchainTxId() {
        return blockchainTxId;
    }

    public String getRawBlockchainData() {
        return rawBlockchainData;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public void setCrimeType(String crimeType) {
        this.crimeType = crimeType;
    }

    public void setCrimeTypeId(Integer crimeTypeId) {
        this.crimeTypeId = crimeTypeId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public void setOriginalDescription(String originalDescription) {
        this.originalDescription = originalDescription;
    }

    public void setProcessedDescription(String processedDescription) {
        this.processedDescription = processedDescription;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setPoliceStation(String policeStation) {
        this.policeStation = policeStation;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public void setSpamScore(Double spamScore) {
        this.spamScore = spamScore;
    }

    public void setToxicityScores(Map<String, Object> toxicityScores) {
        this.toxicityScores = toxicityScores;
    }

    public void setShapExplanation(Map<String, Object> shapExplanation) {
        this.shapExplanation = shapExplanation;
    }

    public void setReportQuality(String reportQuality) {
        this.reportQuality = reportQuality;
    }

    public void setBlockchainHash(String blockchainHash) {
        this.blockchainHash = blockchainHash;
    }

    public void setBlockchainTimestamp(LocalDateTime blockchainTimestamp) {
        this.blockchainTimestamp = blockchainTimestamp;
    }

    public void setBlockchainTxId(String blockchainTxId) {
        this.blockchainTxId = blockchainTxId;
    }

    public void setRawBlockchainData(String rawBlockchainData) {
        this.rawBlockchainData = rawBlockchainData;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Long getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(Long assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAdminStatus() {
        return adminStatus;
    }

    public void setAdminStatus(String adminStatus) {
        this.adminStatus = adminStatus;
    }

    public String getPoliceStatus() {
        return policeStatus;
    }

    public void setPoliceStatus(String policeStatus) {
        this.policeStatus = policeStatus;
    }

    public String getPoliceFeedback() {
        return policeFeedback;
    }

    public void setPoliceFeedback(String policeFeedback) {
        this.policeFeedback = policeFeedback;
    }

    public List<String> getPoliceActionProof() {
        return policeActionProof;
    }

    public void setPoliceActionProof(List<String> policeActionProof) {
        this.policeActionProof = policeActionProof;
    }

    public LocalDateTime getActionTakenAt() {
        return actionTakenAt;
    }

    public void setActionTakenAt(LocalDateTime actionTakenAt) {
        this.actionTakenAt = actionTakenAt;
    }

    public Long getActionTakenBy() {
        return actionTakenBy;
    }

    public void setActionTakenBy(Long actionTakenBy) {
        this.actionTakenBy = actionTakenBy;
    }

    public String getAssignedOfficerName() {
        return assignedOfficerName;
    }

    public void setAssignedOfficerName(String assignedOfficerName) {
        this.assignedOfficerName = assignedOfficerName;
    }

    public String getActionTakenByName() {
        return actionTakenByName;
    }

    public void setActionTakenByName(String actionTakenByName) {
        this.actionTakenByName = actionTakenByName;
    }

    public String getReviewedByName() {
        return reviewedByName;
    }

    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
    }

    public Long getReviewedById() {
        return reviewedById;
    }

    public void setReviewedById(Long reviewedById) {
        this.reviewedById = reviewedById;
    }

}