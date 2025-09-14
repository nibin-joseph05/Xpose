package com.crimereport.xpose.services;

import com.crimereport.xpose.dto.CrimeReportDetail;
import com.crimereport.xpose.dto.CrimeReportList;
import com.crimereport.xpose.models.CrimeReport;
import com.crimereport.xpose.repository.CrimeReportRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReportViewService {

    private static final Logger logger = LoggerFactory.getLogger(ReportViewService.class);

    @Autowired
    private CrimeReportRepository crimeReportRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${blockchain.api.host}")
    private String blockchainHost;

    @Value("${blockchain.api.port}")
    private String blockchainPort;

    private final RestTemplate restTemplate = new RestTemplate();

    public Page<CrimeReportList> getAllReports(Pageable pageable) {
        return crimeReportRepository.findAllReportsForList(pageable);
    }

    public List<Map<String, Object>> getBlockchainChain() {
        try {
            String blockchainChainUrl = String.format("http://%s:%s/chain", blockchainHost, blockchainPort);
            List<Map<String, Object>> blockchainResponse = restTemplate.getForObject(blockchainChainUrl, List.class);
            if (blockchainResponse == null) {
                logger.warn("No data received from blockchain chain endpoint");
                return List.of();
            }
            return blockchainResponse;
        } catch (Exception e) {
            logger.error("Failed to fetch blockchain chain: {}", e.getMessage(), e);
            return List.of();
        }
    }

    public CrimeReportDetail getReportDetails(String reportId) {
        Optional<CrimeReport> reportOpt = crimeReportRepository.findDetailedReportById(reportId);
        if (reportOpt.isEmpty()) {
            throw new RuntimeException("Report not found: " + reportId);
        }

        CrimeReport report = reportOpt.get();
        CrimeReportDetail dto = new CrimeReportDetail();

        dto.setReportId(report.getId());
        dto.setCrimeTypeId(report.getCrimeTypeId() != null ? report.getCrimeTypeId().intValue() : null);
        dto.setCrimeType("Unknown");
        dto.setCategoryId(report.getCrimeCategoryId() != null ? report.getCrimeCategoryId().intValue() : null);
        dto.setCategoryName("Unknown");
        dto.setOriginalDescription(report.getOriginalDescription());
        dto.setProcessedDescription(report.getReadabilityEnhancedDescription());
        dto.setAddress(report.getAddress());
        dto.setCity(report.getCity());
        dto.setState(report.getState());
        dto.setPoliceStation(report.getPoliceStation());
        dto.setStatus(report.getStatus() != null ? report.getStatus().name() : "UNKNOWN");
        dto.setUrgency(report.getUrgencyLevel() != null ? report.getUrgencyLevel().name() : "UNKNOWN");
        dto.setSubmittedAt(report.getSubmittedAt());
        dto.setConfidenceScore(report.getConfidenceScore());
        dto.setSpamScore(report.getSpamScore());
        dto.setToxicityScores(parseJsonToMap(report.getToxicityScores()));
        dto.setShapExplanation(parseJsonToMap(report.getShapExplanation()));
        dto.setReportQuality(report.getReportQuality() != null ? report.getReportQuality().name() : "UNKNOWN");
        dto.setBlockchainHash(report.getBlockchainHash());
        dto.setBlockchainTimestamp(report.getBlockchainTimestamp());
        dto.setBlockchainTxId(report.getBlockchainTxId());

        try {
            String blockchainDataUrl = String.format("http://%s:%s/report/%s", blockchainHost, blockchainPort, reportId);
            Map<String, Object> blockchainResponse = restTemplate.getForObject(blockchainDataUrl, Map.class);

            if (blockchainResponse != null && blockchainResponse.containsKey("data")) {
                Map<String, Object> blockData = (Map<String, Object>) blockchainResponse.get("data");
                dto.setRawBlockchainData(objectMapper.writeValueAsString(blockchainResponse));
                if (blockData.get("description") != null) {
                    dto.setOriginalDescription((String) blockData.get("description"));
                }
                if (blockData.get("translatedText") != null) {
                    dto.setProcessedDescription((String) blockData.get("translatedText"));
                }
                if (blockData.get("address") != null) {
                    dto.setAddress((String) blockData.get("address"));
                }
                if (blockData.get("city") != null) {
                    dto.setCity((String) blockData.get("city"));
                }
                if (blockData.get("state") != null) {
                    dto.setState((String) blockData.get("state"));
                }
                if (blockData.get("submittedAt") != null) {
                    dto.setSubmittedAt(LocalDateTime.parse((String) blockData.get("submittedAt")));
                }
            } else {
                logger.warn("Invalid blockchain response for report: {}", reportId);
            }
        } catch (Exception e) {
            logger.warn("Failed to fetch blockchain data for report: {}", reportId, e);
        }

        return dto;
    }

    private Map<String, Object> parseJsonToMap(String json) {
        if (json == null || json.trim().isEmpty()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            logger.warn("Failed to parse JSON: {}", json, e);
            return Map.of();
        }
    }
}