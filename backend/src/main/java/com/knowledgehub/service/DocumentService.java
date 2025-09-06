package com.knowledgehub.service;

import com.knowledgehub.entity.DocumentEntity;
import com.knowledgehub.entity.User;
import com.knowledgehub.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    private static final String UPLOAD_DIR = "./uploads";
    
    public DocumentEntity uploadDocument(MultipartFile file, String title, String description, 
                                 List<String> tags, DocumentEntity.Visibility visibility, User owner) {
        try {
            // Validate file
            validateFile(file);
            
            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);
            
            // Create document entity
            DocumentEntity document = new DocumentEntity();
            document.setTitle(title);
            document.setDescription(description);
            document.setFileName(originalFilename);
            document.setFilePath(filePath.toString());
            document.setFileType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setTags(tags);
            document.setVisibility(visibility);
            document.setOwner(owner);
            document.setSummary(generateSummary(description)); // Auto-generate summary
            
            return documentRepository.save(document);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
    
    public Optional<DocumentEntity> findById(String id) {
        return documentRepository.findById(id);
    }
    
    public Page<DocumentEntity> searchDocuments(String searchText, List<String> tags, 
                                        DocumentEntity.Visibility visibility, Pageable pageable) {
        if (searchText != null && !searchText.trim().isEmpty()) {
            return documentRepository.findByTextSearch(searchText, pageable);
        } else if (tags != null && !tags.isEmpty()) {
            return documentRepository.findByTagsIn(tags, pageable);
        } else if (visibility != null) {
            return documentRepository.findByVisibility(visibility, pageable);
        } else {
            return documentRepository.findAll(pageable);
        }
    }
    
    public Page<DocumentEntity> getRecentDocuments(Pageable pageable) {
        return documentRepository.findByOrderByCreatedAtDesc(pageable);
    }
    
    public Page<DocumentEntity> getPopularDocuments(Pageable pageable) {
        return documentRepository.findPopularDocuments(3.0, 10, pageable);
    }
    
    public Page<DocumentEntity> getUserDocuments(User user, Pageable pageable) {
        return documentRepository.findByOwner(user, pageable);
    }
    
    public DocumentEntity updateDocument(String id, String title, String description, 
                                 List<String> tags, DocumentEntity.Visibility visibility, User user) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
        
        // Check if user is owner
        if (!document.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to update this document");
        }
        
        document.setTitle(title);
        document.setDescription(description);
        document.setTags(tags);
        document.setVisibility(visibility);
        document.setUpdatedAt(LocalDateTime.now());
        
        return documentRepository.save(document);
    }
    
    public void deleteDocument(String id, User user) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
        
        // Check if user is owner
        if (!document.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this document");
        }
        
        // Delete file from filesystem
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (IOException e) {
            // Log error but continue with database deletion
        }
        
        documentRepository.delete(document);
    }
    
    public DocumentEntity incrementViewCount(String id) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DocumentEntity not found"));
        
        document.setViewCount(document.getViewCount() + 1);
        return documentRepository.save(document);
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new RuntimeException("File size exceeds 10MB limit");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedFileType(contentType)) {
            throw new RuntimeException("File type not allowed");
        }
    }
    
    private boolean isAllowedFileType(String contentType) {
        return contentType.equals("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.equals("image/jpeg") ||
               contentType.equals("image/png");
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
    
    private String generateSummary(String description) {
        if (description == null || description.length() <= 500) {
            return description;
        }
        return description.substring(0, 500) + "...";
    }
    
    public DocumentEntity saveDocument(DocumentEntity document) {
        return documentRepository.save(document);
    }
}
