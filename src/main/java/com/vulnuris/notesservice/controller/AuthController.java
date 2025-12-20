package com.vulnuris.notesservice.controller;

import com.vulnuris.notesservice.dto.LoginRequest;
import com.vulnuris.notesservice.dto.RegisterRequest;
import com.vulnuris.notesservice.model.Role;
import com.vulnuris.notesservice.model.User;
import com.vulnuris.notesservice.repository.UserRepository;
import com.vulnuris.notesservice.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In production, hash this!
        user.setTenantId(request.getTenantId());

        // Set role (default to MEMBER if not specified)
        try {
            user.setRole(Role.valueOf(request.getRole() != null ? request.getRole() : "MEMBER"));
        } catch (IllegalArgumentException e) {
            user.setRole(Role.MEMBER);
        }

        // Save user
        user = userRepository.save(user);

        // Generate JWT token for immediate login
        String token = JwtUtil.generateToken(
                user.getId(),
                user.getTenantId(),
                user.getRole().name()
        );

        return ResponseEntity.ok(token);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // password check skipped for assignment simplicity

        return JwtUtil.generateToken(
                user.getId(),
                user.getTenantId(),
                user.getRole().name()
        );
    }
}

