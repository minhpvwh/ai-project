package com.knowledgehub.repository;

import com.knowledgehub.entity.Comment;
import com.knowledgehub.entity.DocumentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    Page<Comment> findByDocumentOrderByCreatedAtDesc(DocumentEntity document, Pageable pageable);
    long countByDocument(DocumentEntity document);
}
