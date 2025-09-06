package com.knowledgehub.dto;

public class LoginResponse {
    private String token;
    private String username;
    private String fullName;
    private String email;
    private String message;

    public LoginResponse() {}

    public LoginResponse(String token, String username, String fullName, String email) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.message = "Login successful";
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
