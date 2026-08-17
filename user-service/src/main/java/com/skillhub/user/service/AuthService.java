package com.skillhub.user.service;

import com.skillhub.user.dto.RegisterRequest;
import com.skillhub.user.model.User;
import com.skillhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username/Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .title(request.getTitle())
                .skills(request.getSkills())
                .resumeUrl(request.getResumeUrl())
                .companyName(request.getCompanyName())
                .companyWebsite(request.getCompanyWebsite())
                .companyDescription(request.getCompanyDescription())
                .build();

        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
