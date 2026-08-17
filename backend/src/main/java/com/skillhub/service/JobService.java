package com.skillhub.service;

import com.skillhub.dto.JobRequest;
import com.skillhub.model.Job;
import com.skillhub.model.User;
import com.skillhub.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public List<Job> searchJobs(String title, String location) {
        // Handle empty strings as null for SQL query mapping
        String titleParam = (title != null && !title.trim().isEmpty()) ? title.trim() : null;
        String locationParam = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
        return jobRepository.searchJobs(titleParam, locationParam);
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job listing not found with ID: " + id));
    }

    public List<Job> getJobsByEmployer(Long employerId) {
        return jobRepository.findByEmployerId(employerId);
    }

    public Job createJob(JobRequest request, User employer) {
        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .location(request.getLocation())
                .salaryRange(request.getSalaryRange())
                .employer(employer)
                .build();
        return jobRepository.save(job);
    }

    public Job updateJob(Long id, JobRequest request, User employer) {
        Job job = getJobById(id);
        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new AccessDeniedException("You are not authorized to update this job listing");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setLocation(request.getLocation());
        job.setSalaryRange(request.getSalaryRange());

        return jobRepository.save(job);
    }

    public void deleteJob(Long id, User employer) {
        Job job = getJobById(id);
        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this job listing");
        }
        jobRepository.delete(job);
    }
}
