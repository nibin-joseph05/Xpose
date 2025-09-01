package com.crimereport.xpose.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class MLService {

    private static final Logger logger = LoggerFactory.getLogger(MLService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.api.host}")
    private String host;

    @Value("${ml.api.port}")
    private String port;

    @Value("${ml.api.path}")
    private String path;

    public Map<String, Object> classifyDescription(String description) {
        try {
            String fastApiUrl = String.format("http://%s:%s%s", host, port, path);
            logger.info("Sending crime description to FastAPI [{}] for ML classification...", fastApiUrl);

            Map<String, String> request = Map.of("description", description);

            Map<String, Object> response = restTemplate.postForObject(fastApiUrl, request, Map.class);

            logger.info("Received classification from FastAPI: {}", response);
            return response;
        } catch (Exception e) {
            logger.error("Error calling FastAPI: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to classify description with FastAPI", e);
        }
    }
}
