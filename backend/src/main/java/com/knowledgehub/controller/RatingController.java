package com.knowledgehub.controller;

import com.knowledgehub.entity.DocumentEntity;
import com.knowledgehub.entity.Rating;
import com.knowledgehub.entity.User;
import com.knowledgehub.security.JwtUtil;
import com.knowledgehub.service.DocumentService;
import com.knowledgehub.service.RatingService;
import com.knowledgehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/ratings")
@CrossOrigin(origins = "*")
public class RatingController {
    
    @Autowired
    private RatingService ratingService;
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private User getCurrentUser(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String username = jwtUtil.extractUsername(token);
            return userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("No authentication token found");
    }
    
    @PostMapping("/{documentId}")
    public ResponseEntity<?> addOrUpdateRating(
            @PathVariable String documentId,
            @RequestBody Map<String, Integer> request,
            HttpServletRequest httpRequest) {
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            DocumentEntity document = documentService.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
            
            Integer score = request.get("score");
            if (score == null || score < 1 || score > 5) {
                throw new RuntimeException("Rating score must be between 1 and 5");
            }
            
            Rating rating = ratingService.addOrUpdateRating(score, currentUser, document);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", rating.getId());
            response.put("score", rating.getScore());
            response.put("userId", rating.getUser().getId());
            response.put("documentId", rating.getDocument().getId());
            response.put("createdAt", rating.getCreatedAt());
            response.put("updatedAt", rating.getUpdatedAt());
            
            // Include updated document rating info
            response.put("documentAverageRating", document.getAverageRating());
            response.put("documentTotalRatings", document.getTotalRatings());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{documentId}/user")
    public ResponseEntity<?> getUserRating(
            @PathVariable String documentId,
            HttpServletRequest request) {
        
        try {
            User currentUser = getCurrentUser(request);
            DocumentEntity document = documentService.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
            
            Optional<Rating> rating = ratingService.getUserRating(currentUser, document);
            
            Map<String, Object> response = new HashMap<>();
            if (rating.isPresent()) {
                response.put("hasRating", true);
                response.put("score", rating.get().getScore());
                response.put("createdAt", rating.get().getCreatedAt());
                response.put("updatedAt", rating.get().getUpdatedAt());
            } else {
                response.put("hasRating", false);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{documentId}/all")
    public ResponseEntity<?> getDocumentRatings(@PathVariable String documentId) {
        try {
            DocumentEntity document = documentService.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
            
            List<Rating> ratings = ratingService.getDocumentRatings(document);
            
            List<Map<String, Object>> response = ratings.stream().map(rating -> {
                Map<String, Object> ratingData = new HashMap<>();
                ratingData.put("id", rating.getId());
                ratingData.put("score", rating.getScore());
                ratingData.put("userName", rating.getUser().getFullName());
                ratingData.put("userId", rating.getUser().getId());
                ratingData.put("createdAt", rating.getCreatedAt());
                return ratingData;
            }).toList();
            
            Map<String, Object> result = new HashMap<>();
            result.put("ratings", response);
            result.put("averageRating", document.getAverageRating());
            result.put("totalRatings", document.getTotalRatings());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{ratingId}")
    public ResponseEntity<?> deleteRating(@PathVariable String ratingId, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            ratingService.deleteRating(ratingId, currentUser);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Rating deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
