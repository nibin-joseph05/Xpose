package com.crimereport.xpose.controllers;

import com.crimereport.xpose.dto.CrimeReportList;
import com.crimereport.xpose.services.ReportSearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import org.springframework.data.domain.Pageable;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
public class ReportSearchWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(ReportSearchWebSocketController.class);

    @Autowired
    private ReportSearchService reportSearchService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/search.reports")
    @SendTo("/topic/search.results")
    public List<CrimeReportList> searchReports(SearchRequest request) {
        try {
            logger.info("WebSocket search request for query: {}", request.getQuery());

            Pageable pageable = PageRequest.of(0, 50);

            List<CrimeReportList> results = reportSearchService.searchReports(
                    request.getQuery(),
                    request.getFilters(),
                    pageable
            );

            messagingTemplate.convertAndSend("/topic/search.stats",
                    Map.of("query", request.getQuery(), "resultsCount", results.size()));

            return results;
        } catch (Exception e) {
            logger.error("Error in WebSocket search: {}", e.getMessage(), e);
            throw new RuntimeException("Search failed: " + e.getMessage());
        }
    }

    @MessageMapping("/search.subscribe")
    @SendToUser("/queue/search.updates")
    public SearchSubscriptionResponse subscribeToSearch(SearchSubscriptionRequest request, Principal principal) {
        logger.info("User {} subscribed to search updates for query: {}", principal.getName(), request.getQuery());

        return new SearchSubscriptionResponse(
                "SUBSCRIBED",
                "Successfully subscribed to search updates for: " + request.getQuery()
        );
    }

    public void broadcastReportUpdate(String reportId, String updateType, Object data) {
        Map<String, Object> update = Map.of(
                "reportId", reportId,
                "updateType", updateType,
                "data", data,
                "timestamp", System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend("/topic/report.updates", update);
        logger.info("Broadcasted update for report {}: {}", reportId, updateType);
    }
}

class SearchRequest {
    private String query;
    private Map<String, Object> filters;
    private Pageable pageable;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public Map<String, Object> getFilters() { return filters; }
    public void setFilters(Map<String, Object> filters) { this.filters = filters; }
    public Pageable getPageable() { return pageable; }
    public void setPageable(Pageable pageable) { this.pageable = pageable; }
}

class SearchSubscriptionRequest {
    private String query;
    private String sessionId;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}

class SearchSubscriptionResponse {
    private String status;
    private String message;

    public SearchSubscriptionResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public String getStatus() { return status; }
    public String getMessage() { return message; }
}