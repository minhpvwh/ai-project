package com.knowledgehub.controller;

import com.knowledgehub.dto.LoginRequest;
import com.knowledgehub.dto.LoginResponse;
import com.knowledgehub.entity.User;
import com.knowledgehub.security.JwtUtil;
import com.knowledgehub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Invalid username or password"));
            
            if (!userService.validatePassword(loginRequest.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid username or password");
            }
            
            if (!user.isActive()) {
                throw new RuntimeException("Account is deactivated");
            }
            
            // Update last login
            userService.updateLastLogin(user.getUsername());
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername(), user.getId());
            
            LoginResponse response = new LoginResponse(token, user.getUsername(), 
                    user.getFullName(), user.getEmail());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.createUser(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getId());
            
            LoginResponse response = new LoginResponse(token, savedUser.getUsername(), 
                    savedUser.getFullName(), savedUser.getEmail());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                User user = userService.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("username", user.getUsername());
                response.put("fullName", user.getFullName());
                response.put("email", user.getEmail());
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid token");
                return ResponseEntity.badRequest().body(error);
            }
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
