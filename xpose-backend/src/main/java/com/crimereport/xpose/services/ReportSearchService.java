package com.crimereport.xpose.services;

import com.crimereport.xpose.dto.CrimeReportList;
import com.crimereport.xpose.repository.CrimeReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReportSearchService {

    private static final Logger logger = LoggerFactory.getLogger(ReportSearchService.class);

    @Autowired
    private CrimeReportRepository crimeReportRepository;

    public List<CrimeReportList> searchReports(String query, Map<String, Object> filters, Pageable pageable) {
        try {
            logger.info("Searching reports with query: {}, filters: {}", query, filters);

            if ((query == null || query.trim().isEmpty()) &&
                    (filters == null || filters.isEmpty())) {
                return crimeReportRepository.findAllReportsForList(
                        pageable, null, null
                ).getContent();
            }

            if (query != null && !query.trim().isEmpty()) {
                return searchByTextQuery(query, filters, pageable);
            } else {
                return searchByFilters(filters, pageable);
            }

        } catch (Exception e) {
            logger.error("Error searching reports: {}", e.getMessage(), e);
            throw new RuntimeException("Search operation failed: " + e.getMessage());
        }
    }

    private List<CrimeReportList> searchByTextQuery(String query, Map<String, Object> filters, Pageable pageable) {
        String searchTerm = "%" + query.toLowerCase() + "%";

        List<CrimeReportList> allReports = crimeReportRepository.findAllReportsForList(
                pageable, null, null
        ).getContent();

        return allReports.stream()
                .filter(report ->
                        (report.getCrimeType() != null && report.getCrimeType().toLowerCase().contains(query.toLowerCase())) ||
                                (report.getOriginalDescription() != null && report.getOriginalDescription().toLowerCase().contains(query.toLowerCase())) ||
                                (report.getTranslatedDescription() != null && report.getTranslatedDescription().toLowerCase().contains(query.toLowerCase())) ||
                                (report.getAddress() != null && report.getAddress().toLowerCase().contains(query.toLowerCase())) ||
                                (report.getReportId() != null && report.getReportId().toLowerCase().contains(query.toLowerCase()))
                )
                .toList();
    }

    private List<CrimeReportList> searchByFilters(Map<String, Object> filters, Pageable pageable) {
        List<CrimeReportList> allReports = crimeReportRepository.findAllReportsForList(
                pageable, null, null
        ).getContent();

        return allReports.stream()
                .filter(report -> applyFilters(report, filters))
                .toList();
    }

    private boolean applyFilters(CrimeReportList report, Map<String, Object> filters) {
        if (filters == null) return true;

        for (Map.Entry<String, Object> entry : filters.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            switch (key) {
                case "status":
                    if (!report.getStatus().equals(value)) return false;
                    break;
                case "adminStatus":
                    if (!report.getAdminStatus().equals(value)) return false;
                    break;
                case "policeStatus":
                    if (!report.getPoliceStatus().equals(value)) return false;
                    break;
                case "urgency":
                    if (!report.getUrgency().equals(value)) return false;
                    break;
                case "crimeType":
                    if (!report.getCrimeType().toLowerCase().contains(value.toString().toLowerCase()))
                        return false;
                    break;
            }
        }

        return true;
    }
}