package com.vulnuris.notesservice.controller;

import com.vulnuris.notesservice.dto.LoginRequest;
import com.vulnuris.notesservice.dto.RegisterRequest;
import com.vulnuris.notesservice.model.Role;
import com.vulnuris.notesservice.model.User;
import com.vulnuris.notesservice.repository.UserRepository;
import com.vulnuris.notesservice.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Register a new user.
     *
     * Supports invitation-based tenant assignment:
     * - No inviteCode: User assigned to Tenant 2 (FREE plan, MEMBER role)
     * - "TENANT1_PRO_INVITE": User assigned to Tenant 1 (PRO plan, ADMIN role)
     *
     * All Tenant 1 users are PRO and ADMIN.
     * In production, this would use cryptographically signed invitation tokens.
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In production, hash with BCryptPasswordEncoder

        // Controlled tenant assignment via invite code
        Long tenantId = 2L; // Default to Tenant 2 (FREE plan)
        Role userRole = Role.MEMBER; // Default role for Tenant 2

        if ("TENANT1_PRO_INVITE".equals(request.getInviteCode())) {
            tenantId = 1L; // Assign to Tenant 1 (PRO plan) if invite code matches
            userRole = Role.ADMIN; // Tenant 1 users are always ADMIN
        }

        user.setTenantId(tenantId);
        user.setRole(userRole);

        // Save user
        user = userRepository.save(user);

        // Generate JWT token for immediate login
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getTenantId(),
                user.getRole().name()
        );

        return ResponseEntity.ok(token);
    }

    /**
     * Login endpoint with password validation.
     *
     * Note: Plain text password comparison is used for assignment simplicity.
     * In production, use BCryptPasswordEncoder.matches() with hashed passwords.
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        // Validate user exists and password matches (plain text comparison for assignment)
        if (user == null || !user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getTenantId(),
                user.getRole().name()
        );

        return ResponseEntity.ok(token);
    }
}

