package com.crimereport.xpose.dto;

import com.crimereport.xpose.models.CrimeReport.ReportStatus;
import com.crimereport.xpose.models.CrimeReport.UrgencyLevel;
import java.time.LocalDateTime;
import com.crimereport.xpose.models.CrimeReport.*;

public class CrimeReportList {
    private String reportId;
    private String crimeType;
    private Long crimeTypeId;
    private Long categoryId;
    private String categoryName;
    private String originalDescription;
    private String translatedDescription;
    private String address;
    private String city;
    private String state;
    private String policeStation;
    private String status;
    private String urgency;
    private LocalDateTime submittedAt;
    private Long assignedOfficerId;
    private String adminStatus;
    private String policeStatus;

    public CrimeReportList() {
    }

    public CrimeReportList(
            String id,
            String crimeType,
            Long crimeTypeId,
            Long categoryId,
            String categoryName,
            String originalDescription,
            String translatedDescription,
            String address,
            String city,
            String state,
            String policeStation,
            ReportStatus status,
            UrgencyLevel urgency,
            LocalDateTime submittedAt,
            Long assignedOfficerId,
            AdminStatus adminStatus,
            PoliceStatus policeStatus
    ) {
        this.reportId = id;
        this.crimeType = crimeType;
        this.crimeTypeId = crimeTypeId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.originalDescription = originalDescription;
        this.translatedDescription = translatedDescription;
        this.address = address;
        this.city = city;
        this.state = state;
        this.policeStation = policeStation;
        this.status = status != null ? status.toString() : null;
        this.urgency = urgency != null ? urgency.toString() : null;
        this.submittedAt = submittedAt;
        this.assignedOfficerId = assignedOfficerId;
        this.adminStatus = adminStatus != null ? adminStatus.toString() : null;
        this.policeStatus = policeStatus != null ? policeStatus.toString() : null;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public String getCrimeType() {
        return crimeType;
    }

    public void setCrimeType(String crimeType) {
        this.crimeType = crimeType;
    }

    public Long getCrimeTypeId() {
        return crimeTypeId;
    }

    public void setCrimeTypeId(Long crimeTypeId) {
        this.crimeTypeId = crimeTypeId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getOriginalDescription() {
        return originalDescription;
    }

    public void setOriginalDescription(String originalDescription) {
        this.originalDescription = originalDescription;
    }

    public String getTranslatedDescription() {
        return translatedDescription;
    }

    public void setTranslatedDescription(String translatedDescription) {
        this.translatedDescription = translatedDescription;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPoliceStation() {
        return policeStation;
    }

    public void setPoliceStation(String policeStation) {
        this.policeStation = policeStation;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Long getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(Long assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
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

}