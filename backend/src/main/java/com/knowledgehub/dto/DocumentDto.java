package com.knowledgehub.dto;

import com.knowledgehub.entity.DocumentEntity;
import java.time.LocalDateTime;
import java.util.List;

public class DocumentDto {
    private String id;
    private String title;
    private String description;
    private String fileName;
    private String fileType;
    private long fileSize;
    private List<String> tags;
    private DocumentEntity.Visibility visibility;
    private String summary;
    private String ownerName;
    private String ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int viewCount;
    private double averageRating;
    private int totalRatings;

    public DocumentDto() {}

    public DocumentDto(DocumentEntity document) {
        this.id = document.getId();
        this.title = document.getTitle();
        this.description = document.getDescription();
        this.fileName = document.getFileName();
        this.fileType = document.getFileType();
        this.fileSize = document.getFileSize();
        this.tags = document.getTags();
        this.visibility = document.getVisibility();
        this.summary = document.getSummary();
        this.ownerName = document.getOwner() != null ? document.getOwner().getFullName() : null;
        this.ownerId = document.getOwner() != null ? document.getOwner().getId() : null;
        this.createdAt = document.getCreatedAt();
        this.updatedAt = document.getUpdatedAt();
        this.viewCount = document.getViewCount();
        this.averageRating = document.getAverageRating();
        this.totalRatings = document.getTotalRatings();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public DocumentEntity.Visibility getVisibility() {
        return visibility;
    }

    public void setVisibility(DocumentEntity.Visibility visibility) {
        this.visibility = visibility;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getViewCount() {
        return viewCount;
    }

    public void setViewCount(int viewCount) {
        this.viewCount = viewCount;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getTotalRatings() {
        return totalRatings;
    }

    public void setTotalRatings(int totalRatings) {
        this.totalRatings = totalRatings;
    }
}
