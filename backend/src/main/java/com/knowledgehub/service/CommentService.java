package com.knowledgehub.service;

import com.knowledgehub.entity.Comment;
import com.knowledgehub.entity.DocumentEntity;
import com.knowledgehub.entity.User;
import com.knowledgehub.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    public Comment addComment(String content, User author, DocumentEntity document) {
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setAuthor(author);
        comment.setDocument(document);
        
        return commentRepository.save(comment);
    }
    
    public Page<Comment> getDocumentComments(DocumentEntity document, Pageable pageable) {
        return commentRepository.findByDocumentOrderByCreatedAtDesc(document, pageable);
    }
    
    public Optional<Comment> findById(String id) {
        return commentRepository.findById(id);
    }
    
    public Comment updateComment(String id, String content, User user) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Check if user is author
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to update this comment");
        }
        
        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        
        return commentRepository.save(comment);
    }
    
    public void deleteComment(String id, User user) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Check if user is author
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }
    
    public long getCommentCount(DocumentEntity document) {
        return commentRepository.countByDocument(document);
    }
}
