package com.knowledgehub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class AIService {
    
    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public AIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    public AIProcessResult processFile(MultipartFile file) throws IOException {
        try {
            // Prepare request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Create multipart request body
            org.springframework.util.LinkedMultiValueMap<String, Object> body = 
                new org.springframework.util.LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            
            HttpEntity<org.springframework.util.LinkedMultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            // Call AI service
            String url = aiServiceUrl + "/api/ai/process-file";
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, requestEntity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                return new AIProcessResult(
                    (String) result.get("summary"),
                    (java.util.List<String>) result.get("tags"),
                    (String) result.get("language"),
                    true,
                    (String) result.get("message")
                );
            } else {
                return new AIProcessResult(null, null, null, false, "AI service returned error");
            }
            
        } catch (Exception e) {
            System.err.println("Error calling AI service: " + e.getMessage());
            return new AIProcessResult(null, null, null, false, "AI service unavailable: " + e.getMessage());
        }
    }
    
    public AIProcessResult processText(String content, String title) {
        try {
            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("content", content);
            if (title != null) {
                requestBody.put("title", title);
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            // Call AI service
            String url = aiServiceUrl + "/api/ai/process-text";
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, requestEntity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                return new AIProcessResult(
                    (String) result.get("summary"),
                    (java.util.List<String>) result.get("tags"),
                    (String) result.get("language"),
                    true,
                    (String) result.get("message")
                );
            } else {
                return new AIProcessResult(null, null, null, false, "AI service returned error");
            }
            
        } catch (Exception e) {
            System.err.println("Error calling AI service: " + e.getMessage());
            return new AIProcessResult(null, null, null, false, "AI service unavailable: " + e.getMessage());
        }
    }
    
    public boolean isAIServiceAvailable() {
        try {
            String url = aiServiceUrl + "/api/ai/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }
    
    public static class AIProcessResult {
        private final String summary;
        private final java.util.List<String> tags;
        private final String language;
        private final boolean success;
        private final String message;
        
        public AIProcessResult(String summary, java.util.List<String> tags, String language, boolean success, String message) {
            this.summary = summary;
            this.tags = tags;
            this.language = language;
            this.success = success;
            this.message = message;
        }
        
        public String getSummary() { return summary; }
        public java.util.List<String> getTags() { return tags; }
        public String getLanguage() { return language; }
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }
}
