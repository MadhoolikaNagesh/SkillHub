package com.skillhub.controller;

import com.skillhub.dto.AdminStatsDto;
import com.skillhub.model.Job;
import com.skillhub.model.Role;
import com.skillhub.model.User;
import com.skillhub.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        log.info("[ADMIN] Fetching system overview metrics");
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("[ADMIN] Listing all registered users");
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        log.info("[ADMIN] Toggling account status for user ID: {}", id);
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        log.info("[ADMIN] Updating role for user ID: {} to {}", id, role);
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.warn("[ADMIN] Deleting user account ID: {}", id);
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        log.info("[ADMIN] Listing all jobs for moderation");
        return ResponseEntity.ok(adminService.getAllJobs());
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        log.warn("[ADMIN] Moderation: Deleting job listing ID: {}", id);
        adminService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
