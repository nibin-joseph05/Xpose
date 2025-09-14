package com.crimereport.xpose.dto;

import java.time.LocalDateTime;
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
}