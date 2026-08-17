package com.skillhub.job.config;

import com.skillhub.job.model.*;
import com.skillhub.job.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (jobRepository.count() > 0) {
            return; // DB already populated
        }

        // Get or create Employer
        User employer = userRepository.findByUsername("employer@skillhub.com")
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username("employer@skillhub.com")
                            .password(new BCryptPasswordEncoder().encode("password"))
                            .fullName("Sarah Jenkins")
                            .role(Role.EMPLOYER)
                            .companyName("InnovateTech Solutions")
                            .companyWebsite("https://innovatetech.io")
                            .companyDescription("InnovateTech is a scaling software firm delivering cloud native solutions globally.")
                            .build();
                    return userRepository.save(newUser);
                });

        // Get or create Candidate
        User candidate = userRepository.findByUsername("candidate@skillhub.com")
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username("candidate@skillhub.com")
                            .password(new BCryptPasswordEncoder().encode("password"))
                            .fullName("Alex Rivera")
                            .role(Role.CANDIDATE)
                            .title("Fullstack Developer")
                            .skills("React, JavaScript, Java, Spring Boot, Postgres")
                            .resumeUrl("https://drive.google.com/file/d/sample-resume/view")
                            .build();
                    return userRepository.save(newUser);
                });

        // Create Job Listings
        Job job1 = Job.builder()
                .title("Senior React Developer")
                .description("We are looking for a Senior React Developer to join our frontend team. You will lead the migration from legacy JSP templates to a modern React SPA using Tailwind and React Query.")
                .requirements("5+ years React experience\nProficiency with TailwindCSS\nExperience with REST API consumption")
                .location("Remote (USA)")
                .salaryRange("$120,000 - $140,000 / Year")
                .employer(employer)
                .build();

        Job job2 = Job.builder()
                .title("Spring Boot Microservices Architect")
                .description("Looking for an expert to design and break down our legacy monolith into high-performing, resilient microservices. Scope includes OAuth2, Eureka, Kafka integration.")
                .requirements("7+ years in Enterprise Java\nDeep knowledge of Spring Cloud components\nExperience with Kafka and Resilience4j")
                .location("San Francisco, CA")
                .salaryRange("$150,000 - $180,000 / Year")
                .employer(employer)
                .build();

        Job job3 = Job.builder()
                .title("Freelance Figma UI/UX Designer")
                .description("We need a freelance designer to revamp our customer portal dashboard. Expected contract length: 3 months with extension potential.")
                .requirements("Strong Figma portfolio\nExperience designing dashboard layouts\nUnderstanding of component design systems")
                .location("Remote (Global)")
                .salaryRange("$70 - $90 / Hour")
                .employer(employer)
                .build();

        jobRepository.saveAll(List.of(job1, job2, job3));

        // Create a Sample Application
        Application application = Application.builder()
                .job(job1)
                .candidate(candidate)
                .coverLetter("Hi Sarah, I would love to work on your Senior React Developer listing. I have 6 years of experience working with React and Vite. I have built similar systems and understand state management in and out.")
                .resumeUrl("https://drive.google.com/file/d/sample-resume/view")
                .status(ApplicationStatus.PENDING)
                .build();
        applicationRepository.save(application);

        System.out.println("Jobs and applications database pre-populated successfully!");
    }
}
