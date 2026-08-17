package com.skillhub.job.service;

import com.skillhub.job.dto.ApplicationRequest;
import com.skillhub.job.model.*;
import com.skillhub.job.repository.ApplicationRepository;
import com.skillhub.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public Application applyToJob(Long jobId, ApplicationRequest request, User candidate) {
        if (candidate.getRole() != Role.CANDIDATE) {
            throw new IllegalArgumentException("Only Candidates can apply for jobs");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job listing not found with ID: " + jobId));

        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidate.getId())) {
            throw new IllegalArgumentException("You have already applied for this job listing");
        }

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resumeUrl(request.getResumeUrl())
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsForCandidate(User candidate) {
        return applicationRepository.findByCandidateId(candidate.getId());
    }

    public List<Application> getApplicationsForEmployer(User employer) {
        if (employer.getRole() != Role.EMPLOYER) {
            throw new IllegalArgumentException("Only Employers can view applications for their listings");
        }
        return applicationRepository.findByJobEmployerId(employer.getId());
    }

    public Application updateApplicationStatus(Long applicationId, ApplicationStatus status, User employer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Job application not found with ID: " + applicationId));

        if (!application.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new AccessDeniedException("You are not authorized to review this application");
        }

        application.setStatus(status);
        return applicationRepository.save(application);
    }
}
