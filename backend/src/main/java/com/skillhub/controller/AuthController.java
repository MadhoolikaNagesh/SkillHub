package com.skillhub.controller;

import com.skillhub.config.JwtUserResolver;
import com.skillhub.dto.AuthResponse;
import com.skillhub.dto.LoginRequest;
import com.skillhub.model.User;
import com.skillhub.repository.UserRepository;
import com.skillhub.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtUserResolver jwtUserResolver;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("[AUTH] Processing direct login request for user: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isEnabled()) {
            log.warn("[AUTH] Login attempt for disabled user: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Your account has been deactivated. Please contact support."));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("[AUTH] Invalid password attempt for user: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtService.generateToken(user);
        log.info("[AUTH] Direct authentication successful for user: {} (Role: {})", user.getUsername(), user.getRole());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        return ResponseEntity.ok(user);
    }
}
