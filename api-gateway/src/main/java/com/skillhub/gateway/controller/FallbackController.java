package com.skillhub.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/jobs")
    public ResponseEntity<?> jobServiceFallback() {
        // Return a mock job list notifying the user about the offline state
        List<Map<String, Object>> fallbackJobs = List.of(
            Map.of(
                "id", -1L,
                "title", "SkillHub is in Fallback Mode",
                "description", "We are currently experiencing technical difficulties retrieving job listings. Downstream job services are offline. Please try again later.",
                "requirements", "None",
                "location", "System Offline",
                "salaryRange", "N/A",
                "createdAt", "2026-08-16T00:00:00"
            )
        );
        return ResponseEntity.ok(fallbackJobs);
    }

    @GetMapping("/users")
    public ResponseEntity<?> userServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
            Map.of(
                "error", "User Service Unavailable",
                "message", "Downstream user management services are temporarily offline. User profiles and registration cannot be processed at this moment."
            )
        );
    }
}
