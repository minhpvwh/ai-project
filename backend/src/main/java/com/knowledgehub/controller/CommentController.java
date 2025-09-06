package com.knowledgehub.controller;

import com.knowledgehub.entity.Comment;
import com.knowledgehub.entity.DocumentEntity;
import com.knowledgehub.entity.User;
import com.knowledgehub.security.JwtUtil;
import com.knowledgehub.service.CommentService;
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
@RequestMapping("/comments")
@CrossOrigin(origins = "*")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
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
    public ResponseEntity<?> addComment(
            @PathVariable String documentId,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            DocumentEntity document = documentService.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
            
            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("Comment content cannot be empty");
            }
            
            Comment comment = commentService.addComment(content, currentUser, document);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", comment.getId());
            response.put("content", comment.getContent());
            response.put("authorName", comment.getAuthor().getFullName());
            response.put("authorId", comment.getAuthor().getId());
            response.put("createdAt", comment.getCreatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocumentComments(
            @PathVariable String documentId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        try {
            DocumentEntity document = documentService.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Comment> comments = commentService.getDocumentComments(document, pageable);
            
            Page<Map<String, Object>> response = comments.map(comment -> {
                Map<String, Object> commentData = new HashMap<>();
                commentData.put("id", comment.getId());
                commentData.put("content", comment.getContent());
                commentData.put("authorName", comment.getAuthor().getFullName());
                commentData.put("authorId", comment.getAuthor().getId());
                commentData.put("createdAt", comment.getCreatedAt());
                commentData.put("updatedAt", comment.getUpdatedAt());
                return commentData;
            });
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable String commentId,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            String content = request.get("content");
            
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("Comment content cannot be empty");
            }
            
            Comment comment = commentService.updateComment(commentId, content, currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", comment.getId());
            response.put("content", comment.getContent());
            response.put("authorName", comment.getAuthor().getFullName());
            response.put("authorId", comment.getAuthor().getId());
            response.put("updatedAt", comment.getUpdatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            commentService.deleteComment(commentId, currentUser);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Comment deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
