package com.knowledgehub.repository;

import com.knowledgehub.entity.DocumentEntity;
import com.knowledgehub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {
    
    // Find by visibility
    Page<DocumentEntity> findByVisibility(DocumentEntity.Visibility visibility, Pageable pageable);
    
    // Find by owner
    Page<DocumentEntity> findByOwner(User owner, Pageable pageable);
    
    // Find by owner and visibility
    Page<DocumentEntity> findByOwnerAndVisibility(User owner, DocumentEntity.Visibility visibility, Pageable pageable);
    
    // Text search
    @Query("{ $text: { $search: ?0 } }")
    Page<DocumentEntity> findByTextSearch(String searchText, Pageable pageable);
    
    // Search by title
    @Query("{ 'title': { $regex: ?0, $options: 'i' } }")
    Page<DocumentEntity> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Search by tags
    @Query("{ 'tags': { $in: ?0 } }")
    Page<DocumentEntity> findByTagsIn(List<String> tags, Pageable pageable);
    
    // Find by date range
    Page<DocumentEntity> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Find top rated documents
    @Query("{ 'averageRating': { $gte: ?0 } }")
    Page<DocumentEntity> findByAverageRatingGreaterThanEqual(double minRating, Pageable pageable);
    
    // Find recent documents
    Page<DocumentEntity> findByOrderByCreatedAtDesc(Pageable pageable);
    
    // Find popular documents (by rating and view count)
    @Query("{ $or: [ { 'averageRating': { $gte: ?0 } }, { 'viewCount': { $gte: ?1 } } ] }")
    Page<DocumentEntity> findPopularDocuments(double minRating, int minViewCount, Pageable pageable);
    
    // Count documents by owner
    long countByOwner(User owner);
    
    // Count documents by visibility
    long countByVisibility(DocumentEntity.Visibility visibility);
}
