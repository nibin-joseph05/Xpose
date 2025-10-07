package com.crimereport.xpose.models;

import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import java.time.LocalDateTime;

@Entity
@Table(name = "crime_reports")
public class CrimeReport {

    @Id
    @Column(name = "id", length = 32)
    private String id;

    @Column(name = "crime_category_id", nullable = false)
    private Long crimeCategoryId;

    @Column(name = "crime_type_id")
    private Long crimeTypeId;

    @Column(name = "original_description", columnDefinition = "TEXT", nullable = false)
    private String originalDescription;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String attachments;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column
    private String address;

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String country;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "is_spam")
    private Boolean isSpam;

    @Column(name = "is_toxic")
    private Boolean isToxic;

    @Column(name = "is_hate_speech")
    private Boolean isHateSpeech;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level")
    private UrgencyLevel urgencyLevel;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "police_station")
    private String policeStation;

    @Column(name = "needs_review")
    private Boolean needsReview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_officer_id")
    private Authority assignedOfficerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status")
    private ReviewStatus reviewStatus;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private Authority reviewedBy;

    public ReportQuality getReportQuality() {
        return reportQuality;
    }

    public void setReportQuality(ReportQuality reportQuality) {
        this.reportQuality = reportQuality;
    }

    public enum UrgencyLevel { LOW, MEDIUM, HIGH, CRITICAL }
    public enum ReportQuality { LOW, MEDIUM, HIGH }
    public enum ReportStatus { ACCEPTED, REJECTED, PENDING_REVIEW }
    public enum ProcessingPhase { PRE_PROCESSING, GEMINI_ENRICHED, FINALIZED }
    public enum ReviewStatus { PENDING, APPROVED, REJECTED, ASSIGNED, IN_PROGRESS, RESOLVED }



    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getCrimeCategoryId() {
        return crimeCategoryId;
    }

    public void setCrimeCategoryId(Long crimeCategoryId) {
        this.crimeCategoryId = crimeCategoryId;
    }

    public Long getCrimeTypeId() {
        return crimeTypeId;
    }

    public void setCrimeTypeId(Long crimeTypeId) {
        this.crimeTypeId = crimeTypeId;
    }

    public String getOriginalDescription() {
        return originalDescription;
    }

    public void setOriginalDescription(String originalDescription) {
        this.originalDescription = originalDescription;
    }

    public String getAttachments() {
        return attachments;
    }

    public void setAttachments(String attachments) {
        this.attachments = attachments;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Boolean getSpam()   {
        return isSpam;
    }

    public void setSpam(Boolean spam) {
        isSpam = spam;
    }

    public String getPoliceStation() {
        return policeStation;
    }

    public void setPoliceStation(String policeStation) {
        this.policeStation = policeStation;
    }

    public Boolean getToxic() {
        return isToxic;
    }

    public void setToxic(Boolean toxic) {
        isToxic = toxic;
    }

    public Boolean getHateSpeech() {
        return isHateSpeech;
    }

    public void setHateSpeech(Boolean hateSpeech) {
        isHateSpeech = hateSpeech;
    }

    public UrgencyLevel getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(UrgencyLevel urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Boolean getNeedsReview() {
        return needsReview;
    }

    public void setNeedsReview(Boolean needsReview) {
        this.needsReview = needsReview;
    }

    public Double getSpamScore() {
        return spamScore;
    }

    public void setSpamScore(Double spamScore) {
        this.spamScore = spamScore;
    }

    public String getToxicityScores() {
        return toxicityScores;
    }

    public void setToxicityScores(String toxicityScores) {
        this.toxicityScores = toxicityScores;
    }

    public String getShapExplanation() {
        return shapExplanation;
    }

    public void setShapExplanation(String shapExplanation) {
        this.shapExplanation = shapExplanation;
    }

    public String getTranslatedDescription() {
        return translatedDescription;
    }

    public void setTranslatedDescription(String translatedDescription) {
        this.translatedDescription = translatedDescription;
    }

    public String getReadabilityEnhancedDescription() {
        return readabilityEnhancedDescription;
    }

    public void setReadabilityEnhancedDescription(String readabilityEnhancedDescription) {
        this.readabilityEnhancedDescription = readabilityEnhancedDescription;
    }

    public String getLanguageDetected() {
        return languageDetected;
    }

    public void setLanguageDetected(String languageDetected) {
        this.languageDetected = languageDetected;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public Integer getWordCount() {
        return wordCount;
    }

    public void setWordCount(Integer wordCount) {
        this.wordCount = wordCount;
    }

    public Integer getCharCount() {
        return charCount;
    }

    public void setCharCount(Integer charCount) {
        this.charCount = charCount;
    }

    public ProcessingPhase getProcessingPhase() {
        return processingPhase;
    }

    public void setProcessingPhase(ProcessingPhase processingPhase) {
        this.processingPhase = processingPhase;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getBlockchainHash() {
        return blockchainHash;
    }

    public void setBlockchainHash(String blockchainHash) {
        this.blockchainHash = blockchainHash;
    }

    public String getBlockchainTxId() {
        return blockchainTxId;
    }

    public void setBlockchainTxId(String blockchainTxId) {
        this.blockchainTxId = blockchainTxId;
    }

    public LocalDateTime getBlockchainTimestamp() {
        return blockchainTimestamp;
    }

    public void setBlockchainTimestamp(LocalDateTime blockchainTimestamp) {
        this.blockchainTimestamp = blockchainTimestamp;
    }

    public Authority getAssignedOfficer() {
        return assignedOfficerId;
    }

    public void setAssignedOfficer(Authority assignedOfficer) {
        this.assignedOfficerId = assignedOfficer;
    }
    public ReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(ReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public Authority getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Authority reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "report_quality")
    private ReportQuality reportQuality;

    @Column(name = "spam_score")
    private Double spamScore;

    @Type(JsonType.class)
    @Column(name = "toxicity_scores", columnDefinition = "jsonb")
    private String toxicityScores;

    @Type(JsonType.class)
    @Column(name = "shap_explanation", columnDefinition = "jsonb")
    private String shapExplanation;

    @Column(name = "translated_description", columnDefinition = "TEXT")
    private String translatedDescription;

    @Column(name = "readability_enhanced_description", columnDefinition = "TEXT")
    private String readabilityEnhancedDescription;

    @Column(name = "language_detected", length = 10)
    private String languageDetected;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReportStatus status;

    @Column(name = "word_count")
    private Integer wordCount;

    @Column(name = "char_count")
    private Integer charCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_phase")
    private ProcessingPhase processingPhase;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "blockchain_hash")
    private String blockchainHash;

    @Column(name = "blockchain_tx_id")
    private String blockchainTxId;

    @Column(name = "blockchain_timestamp")
    private LocalDateTime blockchainTimestamp;

}