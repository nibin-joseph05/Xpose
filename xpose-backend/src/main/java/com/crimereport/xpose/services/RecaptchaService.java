package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RecaptchaService {

    @Value("${recaptcha.secret-key}")
    private String recaptchaSecret;

    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            System.err.println("ERROR: Token is null or empty");
            return false;
        }

        token = token.trim();

//        System.out.println("DEBUG: Processing token of length: " + token.length());
//        System.out.println("DEBUG: Secret key configured: " + (recaptchaSecret != null && !recaptchaSecret.isEmpty()));

        if (recaptchaSecret == null || recaptchaSecret.trim().isEmpty()) {
            System.err.println("ERROR: reCAPTCHA secret key is not configured");
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", recaptchaSecret.trim());
            params.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

//            System.out.println("DEBUG: Sending request to reCAPTCHA API...");

            ResponseEntity<Map> response = restTemplate.postForEntity(VERIFY_URL, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
//                System.out.println("DEBUG: reCAPTCHA API response: " + body);

                Boolean success = (Boolean) body.get("success");

                if (success != null && success) {
                    System.out.println("SUCCESS: reCAPTCHA verification passed");
                    return true;
                } else {
                    System.err.println("FAILED: reCAPTCHA verification failed");
                    if (body.containsKey("error-codes")) {
                        System.err.println("Error codes: " + body.get("error-codes"));
                    }
                    return false;
                }
            } else {
                System.err.println("ERROR: Unexpected response status: " + response.getStatusCode());
                return false;
            }

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("HTTP Error during reCAPTCHA verification: " + e.getStatusCode() + " - " + e.getMessage());
            System.err.println("Response body: " + e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            System.err.println("Unexpected error during reCAPTCHA verification: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}