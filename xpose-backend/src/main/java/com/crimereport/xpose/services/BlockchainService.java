package com.crimereport.xpose.services;

import com.crimereport.xpose.dto.CrimeReportRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class BlockchainService {

    @Value("${blockchain.api.host}")
    private String host;

    @Value("${blockchain.api.port}")
    private String port;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public BlockchainService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> sendReportToBlockchain(CrimeReportRequest request, String reportId) {
        try {
            Map<String, Object> blockData = new HashMap<>();
            blockData.put("reportId", reportId);
            blockData.put("categoryId", request.getCategoryId());
            blockData.put("crimeTypeId", request.getCrimeTypeId());
            blockData.put("description", request.getDescription());
            blockData.put("translatedText", request.getTranslatedDescription());
            blockData.put("address", request.getPlace());
            blockData.put("city", request.getDistrict());
            blockData.put("state", request.getState());
            blockData.put("country", "India");
            blockData.put("submittedAt", LocalDateTime.now().toString());

            String jsonData = objectMapper.writeValueAsString(blockData);
            System.out.println("Sending to blockchain: " + jsonData);

            String url = String.format("http://%s:%s/add", host, port);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(jsonData, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                return Map.of("success", false);
            }

        } catch (Exception e) {
            System.err.println("Error sending report to blockchain: " + e.getMessage());
            return Map.of("success", false, "error", e.getMessage());
        }
    }

}
