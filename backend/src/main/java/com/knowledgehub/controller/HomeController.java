package com.knowledgehub.controller;

import com.knowledgehub.dto.DocumentDto;
import com.knowledgehub.entity.DocumentEntity;
import com.knowledgehub.entity.User;
import com.knowledgehub.security.JwtUtil;
import com.knowledgehub.service.DocumentService;
import com.knowledgehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/home")
@CrossOrigin(origins = "*")
public class HomeController {
    
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
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            Pageable pageable = PageRequest.of(0, 5);
            
            // Get recent documents (all users)
            Page<DocumentEntity> recentDocuments = documentService.getRecentDocuments(pageable);
            Page<DocumentDto> recentDtos = recentDocuments.map(DocumentDto::new);
            
            // Get popular documents
            Page<DocumentEntity> popularDocuments = documentService.getPopularDocuments(pageable);
            Page<DocumentDto> popularDtos = popularDocuments.map(DocumentDto::new);
            
            // Get user's recent documents
            Page<DocumentEntity> userDocuments = documentService.getUserDocuments(currentUser, pageable);
            Page<DocumentDto> userDtos = userDocuments.map(DocumentDto::new);
            
            Map<String, Object> response = new HashMap<>();
            response.put("newestDocuments", recentDtos.getContent());
            response.put("popularDocuments", popularDtos.getContent());
            response.put("userDocuments", userDtos.getContent());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
