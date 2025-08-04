package com.crimereport.xpose.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RecaptchaService {

    @Value("${recaptcha.secret-key}")
    private String recaptchaSecret;

    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyToken(String token) {
        System.out.println("DEBUG: Recaptcha Secret Key loaded by Spring: '" + recaptchaSecret + "'");
        System.out.println("DEBUG: Recaptcha Secret Key length: " + (recaptchaSecret != null ? recaptchaSecret.length() : "null"));


        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", recaptchaSecret);
        params.add("response", token);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params);
        ResponseEntity<Map> response = restTemplate.postForEntity(VERIFY_URL, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> body = response.getBody();
            System.out.println("reCAPTCHA verification successful response: " + body);
            return (Boolean) body.get("success");
        } else {
            Map<String, Object> errorBody = response.getBody();
            System.err.println("reCAPTCHA verification failed with status: " + response.getStatusCode());
            System.err.println("reCAPTCHA error body: " + errorBody);

            try {
                ObjectMapper mapper = new ObjectMapper();
                String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(errorBody);
                System.err.println("Pretty-printed reCAPTCHA error body:\n" + json);
            } catch (Exception e) {
                System.err.println("Could not pretty print error body: " + e.getMessage());
            }

            if (errorBody != null && errorBody.containsKey("error-codes")) {
                System.err.println("reCAPTCHA specific error codes: " + errorBody.get("error-codes"));
            }
        }

        return false;
    }
}