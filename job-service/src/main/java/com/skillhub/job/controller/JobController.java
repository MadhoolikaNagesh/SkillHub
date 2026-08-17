package com.skillhub.job.controller;

import com.skillhub.job.config.JwtUserResolver;
import com.skillhub.job.dto.JobRequest;
import com.skillhub.job.model.Job;
import com.skillhub.job.model.User;
import com.skillhub.job.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JwtUserResolver jwtUserResolver;

    @GetMapping("/public/all")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/public/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(jobService.searchJobs(title, location));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/my-listings")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Job>> getMyListings(@AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        return ResponseEntity.ok(jobService.getJobsByEmployer(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> createJob(@Valid @RequestBody JobRequest request, @AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        Job job = jobService.createJob(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(job);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        return ResponseEntity.ok(jobService.updateJob(id, request, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        jobService.deleteJob(id, user);
        return ResponseEntity.noContent().build();
    }
}
