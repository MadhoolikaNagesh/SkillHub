package com.skillhub.config;

import com.skillhub.model.User;
import com.skillhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUserResolver {

    private final UserRepository userRepository;

    /**
     * Resolves the authenticated User entity from the JWT subject claim (email).
     * Throws if the user is not found (shouldn't happen if register was called before first login).
     */
    public User resolveUser(Jwt jwt) {
        String username = jwt.getSubject();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database: " + username));
    }
}
