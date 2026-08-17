package com.skillhub.service;

import com.skillhub.dto.AdminStatsDto;
import com.skillhub.model.Job;
import com.skillhub.model.Role;
import com.skillhub.model.User;
import com.skillhub.repository.ApplicationRepository;
import com.skillhub.repository.JobRepository;
import com.skillhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public AdminStatsDto getDashboardStats() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long totalCandidates = users.stream().filter(u -> u.getRole() == Role.CANDIDATE).count();
        long totalEmployers = users.stream().filter(u -> u.getRole() == Role.EMPLOYER).count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();

        log.debug("[ADMIN] Calculated stats - Users: {}, Candidates: {}, Employers: {}, Jobs: {}, Applications: {}",
                totalUsers, totalCandidates, totalEmployers, totalJobs, totalApplications);

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalEmployers(totalEmployers)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .build();
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        log.debug("[ADMIN] Retrieved {} users from database", users.size());
        return users;
    }

    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        boolean oldState = user.isEnabled();
        user.setEnabled(!oldState);
        User saved = userRepository.save(user);
        log.info("[ADMIN] User '{}' (ID: {}) status toggled: {} -> {}", user.getUsername(), userId, oldState, saved.isEnabled());
        return saved;
    }

    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        Role oldRole = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);
        log.info("[ADMIN] User '{}' (ID: {}) role updated: {} -> {}", user.getUsername(), userId, oldRole, newRole);
        return saved;
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        userRepository.delete(user);
        log.warn("[ADMIN] Deleted user account '{}' (ID: {})", user.getUsername(), userId);
    }

    public List<Job> getAllJobs() {
        List<Job> jobs = jobRepository.findAll();
        log.debug("[ADMIN] Retrieved {} jobs from database", jobs.size());
        return jobs;
    }

    @Transactional
    public void deleteJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));
        jobRepository.delete(job);
        log.warn("[ADMIN] Moderation deleted job listing '{}' (ID: {}) posted by employer '{}'",
                job.getTitle(), jobId, job.getEmployer() != null ? job.getEmployer().getUsername() : "Unknown");
    }
}
