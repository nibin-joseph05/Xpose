package com.crimereport.xpose.dto;

public class UpdatePoliceStatusRequest {
    private String reportId;
    private String policeStatus;
    private Long officerId;
    private String feedback;
    private String actionProof;

    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }
    public String getPoliceStatus() { return policeStatus; }
    public void setPoliceStatus(String policeStatus) { this.policeStatus = policeStatus; }
    public Long getOfficerId() { return officerId; }
    public void setOfficerId(Long officerId) { this.officerId = officerId; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getActionProof() { return actionProof; }
    public void setActionProof(String actionProof) { this.actionProof = actionProof; }
}