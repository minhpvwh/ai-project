package com.knowledgehub.repository;

import com.knowledgehub.entity.Rating;
import com.knowledgehub.entity.DocumentEntity;
import com.knowledgehub.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends MongoRepository<Rating, String> {
    Optional<Rating> findByUserAndDocument(User user, DocumentEntity document);
    List<Rating> findByDocument(DocumentEntity document);
    long countByDocument(DocumentEntity document);
    double findAverageScoreByDocument(DocumentEntity document);
}
