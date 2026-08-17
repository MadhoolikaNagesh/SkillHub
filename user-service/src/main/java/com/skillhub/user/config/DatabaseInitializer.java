package com.skillhub.user.config;

import com.skillhub.user.model.Role;
import com.skillhub.user.model.User;
import com.skillhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // DB already populated
        }

        // 1. Create Employer
        User employer = User.builder()
                .username("employer@skillhub.com")
                .password(passwordEncoder.encode("password"))
                .fullName("Sarah Jenkins")
                .role(Role.EMPLOYER)
                .companyName("InnovateTech Solutions")
                .companyWebsite("https://innovatetech.io")
                .companyDescription("InnovateTech is a scaling software firm delivering cloud native solutions globally.")
                .build();
        userRepository.save(employer);

        // 2. Create Candidate
        User candidate = User.builder()
                .username("candidate@skillhub.com")
                .password(passwordEncoder.encode("password"))
                .fullName("Alex Rivera")
                .role(Role.CANDIDATE)
                .title("Fullstack Developer")
                .skills("React, JavaScript, Java, Spring Boot, Postgres")
                .resumeUrl("https://drive.google.com/file/d/sample-resume/view")
                .build();
        userRepository.save(candidate);

        // 3. Create Admin
        User admin = User.builder()
                .username("admin@skillhub.com")
                .password(passwordEncoder.encode("password"))
                .fullName("System Admin")
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);

        System.out.println("User database pre-populated successfully!");
    }
}
