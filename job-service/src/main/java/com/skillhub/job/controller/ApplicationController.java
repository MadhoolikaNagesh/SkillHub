package com.skillhub.job.controller;

import com.skillhub.job.config.JwtUserResolver;
import com.skillhub.job.dto.ApplicationRequest;
import com.skillhub.job.model.*;
import com.skillhub.job.service.ApplicationService;
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
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final JwtUserResolver jwtUserResolver;

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Application> applyToJob(
            @PathVariable Long jobId,
            @Valid @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        Application application = applicationService.applyToJob(jobId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<Application>> getMyApplications(@AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        return ResponseEntity.ok(applicationService.getApplicationsForCandidate(user));
    }

    @GetMapping("/incoming")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Application>> getIncomingApplications(@AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        return ResponseEntity.ok(applicationService.getApplicationsForEmployer(user));
    }

    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status,
            @AuthenticationPrincipal Jwt jwt) {
        User user = jwtUserResolver.resolveUser(jwt);
        return ResponseEntity.ok(applicationService.updateApplicationStatus(applicationId, status, user));
    }
}
