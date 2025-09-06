package com.knowledgehub.service;

import com.knowledgehub.entity.DocumentEntity;
import com.knowledgehub.entity.Rating;
import com.knowledgehub.entity.User;
import com.knowledgehub.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RatingService {
    
    @Autowired
    private RatingRepository ratingRepository;
    
    @Autowired
    private DocumentService documentService;
    
    public Rating addOrUpdateRating(int score, User user, DocumentEntity document) {
        if (score < 1 || score > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        
        Optional<Rating> existingRating = ratingRepository.findByUserAndDocument(user, document);
        
        Rating rating;
        if (existingRating.isPresent()) {
            rating = existingRating.get();
            rating.setScore(score);
            rating.setUpdatedAt(LocalDateTime.now());
        } else {
            rating = new Rating(score, user, document);
        }
        
        rating = ratingRepository.save(rating);
        updateDocumentAverageRating(document);
        
        return rating;
    }
    
    public Optional<Rating> getUserRating(User user, DocumentEntity document) {
        return ratingRepository.findByUserAndDocument(user, document);
    }
    
    public List<Rating> getDocumentRatings(DocumentEntity document) {
        return ratingRepository.findByDocument(document);
    }
    
    public void deleteRating(String id, User user) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rating not found"));
        
        // Check if user is the one who made the rating
        if (!rating.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this rating");
        }
        
        DocumentEntity document = rating.getDocument();
        ratingRepository.delete(rating);
        updateDocumentAverageRating(document);
    }
    
    private void updateDocumentAverageRating(DocumentEntity document) {
        List<Rating> ratings = ratingRepository.findByDocument(document);
        
        if (ratings.isEmpty()) {
            document.setAverageRating(0.0);
            document.setTotalRatings(0);
        } else {
            double sum = ratings.stream().mapToInt(Rating::getScore).sum();
            double average = sum / ratings.size();
            
            document.setAverageRating(Math.round(average * 10.0) / 10.0); // Round to 1 decimal
            document.setTotalRatings(ratings.size());
        }
        
        documentService.saveDocument(document);
    }
    
    public double getAverageRating(DocumentEntity document) {
        return ratingRepository.findAverageScoreByDocument(document);
    }
    
    public long getRatingCount(DocumentEntity document) {
        return ratingRepository.countByDocument(document);
    }
}
