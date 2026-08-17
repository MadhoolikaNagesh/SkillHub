package com.skillhub.job.config;

import com.skillhub.job.model.User;
import com.skillhub.job.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUserResolver {

    private final UserRepository userRepository;

    public User resolveUser(Jwt jwt) {
        String username = jwt.getSubject();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database: " + username));
    }
}
