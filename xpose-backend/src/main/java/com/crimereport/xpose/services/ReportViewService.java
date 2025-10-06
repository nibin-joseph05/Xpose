package com.crimereport.xpose.services;

import com.crimereport.xpose.dto.CrimeReportDetail;
import com.crimereport.xpose.dto.CrimeReportList;
import com.crimereport.xpose.models.*;
import com.crimereport.xpose.repository.*;
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
import java.util.Random;

@Service
public class ReportViewService {

    private static final Logger logger = LoggerFactory.getLogger(ReportViewService.class);

    @Autowired
    private CrimeReportRepository crimeReportRepository;

    @Autowired
    private CrimeTypeRepository crimeTypeRepository;

    @Autowired
    private CrimeCategoryRepository crimeCategoryRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PoliceStationService policeStationService;

    @Autowired
    private PoliceStationRepository policeStationRepository;

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
        logger.info("Fetching report details for ID: {}", reportId);

        Optional<String> reportIdOpt = crimeReportRepository.findReportId(reportId);
        if (reportIdOpt.isPresent()) {
            logger.info("Report ID {} found in database", reportId);
        } else {
            logger.warn("Report ID {} not found in database using simple query", reportId);
        }

        Optional<CrimeReport> reportOpt = crimeReportRepository.findReportWithOfficer(reportId);
        CrimeReport report;
        String crimeTypeName = "Unknown";
        String categoryName = "Unknown";
        Map<String, Object> blockchainResponse = null;

        if (reportOpt.isPresent()) {
            report = reportOpt.get();
            logger.info("Found report in database: ID={}", report.getId());

            try {
                if (report.getCrimeTypeId() != null) {
                    Optional<CrimeType> crimeTypeOpt = crimeTypeRepository.findById(report.getCrimeTypeId());
                    if (crimeTypeOpt.isPresent()) {
                        crimeTypeName = crimeTypeOpt.get().getName();
                        logger.info("CrimeType found: ID={}, Name={}", report.getCrimeTypeId(), crimeTypeName);
                    }
                }
                if (report.getCrimeCategoryId() != null) {
                    Optional<CrimeCategory> crimeCategoryOpt = crimeCategoryRepository.findById(report.getCrimeCategoryId());
                    if (crimeCategoryOpt.isPresent()) {
                        categoryName = crimeCategoryOpt.get().getName();
                        logger.info("CrimeCategory found: ID={}, Name={}", report.getCrimeCategoryId(), categoryName);
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to fetch CrimeType or CrimeCategory for report ID: {}", reportId, e);
            }
        } else {
            logger.warn("No report found in database for ID: {}. Attempting to fetch from blockchain.", reportId);
            try {
                String blockchainDataUrl = String.format("http://%s:%s/report/%s", blockchainHost, blockchainPort, reportId);
                blockchainResponse = restTemplate.getForObject(blockchainDataUrl, Map.class);
                if (blockchainResponse == null || !blockchainResponse.containsKey("data")) {
                    logger.error("No blockchain data found for report ID: {}", reportId);
                    throw new RuntimeException("Report not found: " + reportId);
                }

                Map<String, Object> blockData = (Map<String, Object>) blockchainResponse.get("data");
                report = new CrimeReport();
                report.setId(reportId);
                report.setCrimeCategoryId(((Number) blockData.get("categoryId")).longValue());
                report.setCrimeTypeId(((Number) blockData.get("crimeTypeId")).longValue());
                report.setOriginalDescription((String) blockData.get("description"));
                report.setTranslatedDescription((String) blockData.get("translatedText"));
                report.setReadabilityEnhancedDescription((String) blockData.get("translatedText"));
                report.setAddress((String) blockData.get("address"));
                report.setCity((String) blockData.get("city"));
                report.setState((String) blockData.get("state"));
                report.setCountry((String) blockData.get("country"));
                report.setLatitude(blockData.get("latitude") != null ? ((Number) blockData.get("latitude")).doubleValue() : null);
                report.setLongitude(blockData.get("longitude") != null ? ((Number) blockData.get("longitude")).doubleValue() : null);
                report.setSubmittedAt(LocalDateTime.parse((String) blockData.get("submittedAt")));
                report.setBlockchainHash((String) blockchainResponse.get("hash"));
                report.setBlockchainTimestamp(LocalDateTime.parse((String) blockchainResponse.get("timestamp")));
                report.setStatus(CrimeReport.ReportStatus.ACCEPTED);
                report.setUrgencyLevel(CrimeReport.UrgencyLevel.LOW);
                report.setReportQuality(CrimeReport.ReportQuality.HIGH);

                try {
                    if (report.getCrimeTypeId() != null) {
                        Optional<CrimeType> crimeTypeOpt = crimeTypeRepository.findById(report.getCrimeTypeId());
                        if (crimeTypeOpt.isPresent()) {
                            crimeTypeName = crimeTypeOpt.get().getName();
                            logger.info("CrimeType found for blockchain data: ID={}, Name={}", report.getCrimeTypeId(), crimeTypeName);
                        }
                    }
                    if (report.getCrimeCategoryId() != null) {
                        Optional<CrimeCategory> crimeCategoryOpt = crimeCategoryRepository.findById(report.getCrimeCategoryId());
                        if (crimeCategoryOpt.isPresent()) {
                            categoryName = crimeCategoryOpt.get().getName();
                            logger.info("CrimeCategory found for blockchain data: ID={}, Name={}", report.getCrimeCategoryId(), categoryName);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Failed to fetch CrimeType or CrimeCategory for blockchain data: {}", reportId, e);
                }
            } catch (Exception e) {
                logger.error("Failed to fetch blockchain data for report ID: {}", reportId, e);
                throw new RuntimeException("Report not found: " + reportId);
            }
        }

        CrimeReportDetail dto = new CrimeReportDetail();
        dto.setReportId(report.getId());
        dto.setCrimeTypeId(report.getCrimeTypeId() != null ? report.getCrimeTypeId().intValue() : null);
        dto.setCrimeType(crimeTypeName != null ? crimeTypeName : "Unknown");
        dto.setCategoryId(report.getCrimeCategoryId() != null ? report.getCrimeCategoryId().intValue() : null);
        dto.setCategoryName(categoryName != null ? categoryName : "Unknown");
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
        dto.setLatitude(report.getLatitude());
        dto.setLongitude(report.getLongitude());
        dto.setAssignedOfficerId(report.getAssignedOfficer() != null ? report.getAssignedOfficer().getId() : null);
        if (blockchainResponse != null) {
            try {
                dto.setRawBlockchainData(objectMapper.writeValueAsString(blockchainResponse));
            } catch (Exception e) {
                logger.warn("Failed to serialize blockchain data for report ID: {}", reportId, e);
            }
        }

        return dto;
    }

    public void assignReportToOfficer(String reportId, Long officerId) {
        Optional<CrimeReport> reportOpt = crimeReportRepository.findDetailedReportById(reportId);
        if (reportOpt.isEmpty()) {
            throw new RuntimeException("Report not found: " + reportId);
        }
        Optional<Authority> officerOpt = authorityRepository.findById(officerId);
        if (officerOpt.isEmpty()) {
            throw new RuntimeException("Officer not found: " + officerId);
        }

        CrimeReport report = reportOpt.get();
        report.setAssignedOfficer(officerOpt.get());
        crimeReportRepository.save(report);
        logger.info("Assigned report {} to officer ID {}", reportId, officerId);
    }

    public Long autoAssignReport(String reportId) {
        Optional<CrimeReport> reportOpt = crimeReportRepository.findDetailedReportById(reportId);
        if (reportOpt.isEmpty()) {
            throw new RuntimeException("Report not found: " + reportId);
        }
        CrimeReport report = reportOpt.get();
        if (report.getLatitude() == null || report.getLongitude() == null) {
            throw new RuntimeException("Report location (latitude/longitude) not available for ID: " + reportId);
        }

        Map<String, Object> nearbyStationsResponse = policeStationService.getNearbyPoliceStations(report.getLatitude(), report.getLongitude(), 20000);
        List<Map<String, Object>> stations = (List<Map<String, Object>>) nearbyStationsResponse.get("results");
        if (stations == null || stations.isEmpty()) {
            throw new RuntimeException("No police stations found near report location for ID: " + reportId);
        }

        Map<String, Object> closestStation = stations.get(0);
        String stationName = (String) closestStation.get("name");
        Long stationId = policeStationRepository.findByName(stationName)
                .map(PoliceStation::getId)
                .orElse(null);

        if (stationId == null) {
            PoliceStation newStation = new PoliceStation();
            newStation.setName(stationName);
            newStation.setAddress((String) closestStation.get("vicinity"));
            Map<String, Object> location = (Map<String, Object>) ((Map<String, Object>) closestStation.get("geometry")).get("location");
            newStation.setLatitude(((Number) location.get("lat")).doubleValue());
            newStation.setLongitude(((Number) location.get("lng")).doubleValue());
            newStation.setCreatedAt(LocalDateTime.now());
            stationId = policeStationService.createPoliceStation(newStation).getId();
        }

        List<Authority> stationOfficers = authorityRepository.findByStationId(stationId);
        if (stationOfficers.isEmpty()) {
            throw new RuntimeException("No officers found at station: " + stationName);
        }

        Random random = new Random();
        Authority selectedOfficer = stationOfficers.get(random.nextInt(stationOfficers.size()));
        report.setAssignedOfficer(selectedOfficer);
        report.setPoliceStation(stationName);
        crimeReportRepository.save(report);
        logger.info("Auto-assigned report {} to officer ID {} at station {}", reportId, selectedOfficer.getId(), stationName);
        return selectedOfficer.getId();
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