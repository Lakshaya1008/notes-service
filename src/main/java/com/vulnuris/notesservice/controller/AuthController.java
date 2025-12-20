package com.vulnuris.notesservice.controller;

import com.vulnuris.notesservice.dto.LoginRequest;
import com.vulnuris.notesservice.model.User;
import com.vulnuris.notesservice.repository.UserRepository;
import com.vulnuris.notesservice.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
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

