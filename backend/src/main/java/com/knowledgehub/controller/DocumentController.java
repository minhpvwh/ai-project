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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "*")
public class DocumentController {
    
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
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "visibility", defaultValue = "PRIVATE") String visibility,
            HttpServletRequest request) {
        
        try {
            User currentUser = getCurrentUser(request);
            DocumentEntity.Visibility vis = DocumentEntity.Visibility.valueOf(visibility.toUpperCase());
            
            DocumentEntity document = documentService.uploadDocument(file, title, description, tags, vis, currentUser);
            DocumentDto dto = new DocumentDto(document);
            
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchDocuments(
            @RequestParam(value = "q", required = false) String searchText,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "visibility", required = false) String visibility,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            DocumentEntity.Visibility vis = visibility != null ? DocumentEntity.Visibility.valueOf(visibility.toUpperCase()) : null;
            
            Page<DocumentEntity> documents = documentService.searchDocuments(searchText, tags, vis, pageable);
            Page<DocumentDto> dtos = documents.map(DocumentDto::new);
            
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentDocuments(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<DocumentEntity> documents = documentService.getRecentDocuments(pageable);
            Page<DocumentDto> dtos = documents.map(DocumentDto::new);
            
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/popular")
    public ResponseEntity<?> getPopularDocuments(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<DocumentEntity> documents = documentService.getPopularDocuments(pageable);
            Page<DocumentDto> dtos = documents.map(DocumentDto::new);
            
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/my-documents")
    public ResponseEntity<?> getMyDocuments(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            HttpServletRequest request) {
        
        try {
            User currentUser = getCurrentUser(request);
            Pageable pageable = PageRequest.of(page, size);
            Page<DocumentEntity> documents = documentService.getUserDocuments(currentUser, pageable);
            Page<DocumentDto> dtos = documents.map(DocumentDto::new);
            
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(@PathVariable String id, HttpServletRequest request) {
        try {
            DocumentEntity document = documentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
            
            // Increment view count
            documentService.incrementViewCount(id);
            
            DocumentDto dto = new DocumentDto(document);
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDocument(
            @PathVariable String id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "visibility", required = false) String visibility,
            HttpServletRequest request) {
        
        try {
            User currentUser = getCurrentUser(request);
            DocumentEntity.Visibility vis = visibility != null ? DocumentEntity.Visibility.valueOf(visibility.toUpperCase()) : null;
            
            DocumentEntity document = documentService.updateDocument(id, title, description, tags, vis, currentUser);
            DocumentDto dto = new DocumentDto(document);
            
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable String id, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            documentService.deleteDocument(id, currentUser);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "DocumentEntity deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable String id, HttpServletRequest request) {
        try {
            DocumentEntity document = documentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
            
            // Check visibility permissions
            User currentUser = getCurrentUser(request);
            if (document.getVisibility() == DocumentEntity.Visibility.PRIVATE && 
                !document.getOwner().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            // Read file content
            java.io.File file = new java.io.File(document.getFilePath());
            if (!file.exists()) {
                throw new RuntimeException("File not found on server");
            }
            
            byte[] fileContent = java.nio.file.Files.readAllBytes(file.toPath());
            
            // Set appropriate headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.parseMediaType(document.getFileType()));
            headers.setContentDispositionFormData("attachment", document.getFileName());
            headers.setContentLength(fileContent.length);
            
            return new ResponseEntity<>(fileContent, headers, org.springframework.http.HttpStatus.OK);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
