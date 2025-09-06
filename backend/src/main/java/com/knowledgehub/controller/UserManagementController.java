package com.knowledgehub.controller;

import com.knowledgehub.dto.UserDto;
import com.knowledgehub.entity.User;
import com.knowledgehub.security.JwtUtil;
import com.knowledgehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin/users")
@CrossOrigin(origins = "*")
public class UserManagementController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private User getCurrentUser(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String username = jwtUtil.extractUsername(token);
            return userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("No authentication token found");
    }
    
    // Get all users with pagination
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            
            // Check if user is admin
            if (!currentUser.getRoles().contains("ADMIN")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(403).body(error);
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users;
            
            if (search != null && !search.trim().isEmpty()) {
                users = userService.searchUsers(search, pageable);
            } else {
                users = userService.findAllUsers(pageable);
            }
            
            Page<UserDto> userDtos = users.map(UserDto::new);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", userDtos.getContent());
            response.put("totalElements", userDtos.getTotalElements());
            response.put("totalPages", userDtos.getTotalPages());
            response.put("size", userDtos.getSize());
            response.put("number", userDtos.getNumber());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            
            // Check if user is admin
            if (!currentUser.getRoles().contains("ADMIN")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(403).body(error);
            }
            
            Optional<User> user = userService.findById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(new UserDto(user.get()));
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Create new user
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            
            // Check if user is admin
            if (!currentUser.getRoles().contains("ADMIN")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(403).body(error);
            }
            
            String username = (String) userData.get("username");
            String email = (String) userData.get("email");
            String fullName = (String) userData.get("fullName");
            String password = (String) userData.get("password");
            
            // Validate required fields
            if (username == null || username.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (password == null || password.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Check if username already exists
            if (userService.findByUsername(username).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username already exists");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Check if email already exists
            if (userService.findByEmail(email).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email already exists");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Create new user
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setFullName(fullName);
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setEnabled(true);
            newUser.setAccountNonLocked(true);
            
            User savedUser = userService.save(newUser);
            return ResponseEntity.ok(new UserDto(savedUser));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> userData, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            
            // Check if user is admin
            if (!currentUser.getRoles().contains("ADMIN")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(403).body(error);
            }
            
            Optional<User> userOpt = userService.findById(id);
            if (!userOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Update fields if provided
            if (userData.containsKey("email")) {
                String email = (String) userData.get("email");
                if (email != null && !email.trim().isEmpty()) {
                    // Check if email already exists for another user
                    Optional<User> existingUser = userService.findByEmail(email);
                    if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Email already exists");
                        return ResponseEntity.badRequest().body(error);
                    }
                    user.setEmail(email);
                }
            }
            
            if (userData.containsKey("fullName")) {
                String fullName = (String) userData.get("fullName");
                user.setFullName(fullName);
            }
            
            if (userData.containsKey("enabled")) {
                Boolean enabled = (Boolean) userData.get("enabled");
                if (enabled != null) {
                    user.setEnabled(enabled);
                }
            }
            
            if (userData.containsKey("accountNonLocked")) {
                Boolean accountNonLocked = (Boolean) userData.get("accountNonLocked");
                if (accountNonLocked != null) {
                    user.setAccountNonLocked(accountNonLocked);
                }
            }
            
            User updatedUser = userService.save(user);
            return ResponseEntity.ok(new UserDto(updatedUser));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Update user password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable String id, @RequestBody Map<String, String> passwordData, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            
            // Check if user is admin
            if (!currentUser.getRoles().contains("ADMIN")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(403).body(error);
            }
            
            Optional<User> userOpt = userService.findById(id);
            if (!userOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            String newPassword = passwordData.get("password");
            if (newPassword == null || newPassword.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.save(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password updated successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Block/Unblock user
    @PutMapping("/{id}/block")
    public ResponseEntity<?> toggleUserBlock(@PathVariable String id, @RequestBody Map<String, Boolean> blockData, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            
            // Check if user is admin
            if (!currentUser.getRoles().contains("ADMIN")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(403).body(error);
            }
            
            Optional<User> userOpt = userService.findById(id);
            if (!userOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            Boolean block = blockData.get("block");
            if (block == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Block status is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            User user = userOpt.get();
            user.setAccountNonLocked(!block);
            user.setEnabled(!block);
            
            User updatedUser = userService.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", block ? "User blocked successfully" : "User unblocked successfully");
            response.put("user", new UserDto(updatedUser));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id, HttpServletRequest request) {
        try {
            User currentUser = getCurrentUser(request);
            
            // Check if user is admin
            if (!currentUser.getRoles().contains("ADMIN")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin role required.");
                return ResponseEntity.status(403).body(error);
            }
            
            // Prevent admin from deleting themselves
            if (currentUser.getId().equals(id)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot delete your own account");
                return ResponseEntity.badRequest().body(error);
            }
            
            Optional<User> userOpt = userService.findById(id);
            if (!userOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            userService.deleteById(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
