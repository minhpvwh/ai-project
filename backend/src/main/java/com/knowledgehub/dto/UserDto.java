package com.knowledgehub.dto;

import com.knowledgehub.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class UserDto {
    private String id;
    private String username;
    private String fullName;
    private String email;
    private List<String> roles;
    private boolean enabled;
    private boolean accountNonLocked;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private int documentCount;

    // Constructors
    public UserDto() {}

    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.roles = user.getRoles();
        this.enabled = user.isEnabled();
        this.accountNonLocked = user.isAccountNonLocked();
        this.createdAt = user.getCreatedAt();
        this.lastLoginAt = user.getLastLoginAt();
        this.documentCount = user.getDocuments() != null ? user.getDocuments().size() : 0;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    public void setAccountNonLocked(boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public int getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(int documentCount) {
        this.documentCount = documentCount;
    }
}
