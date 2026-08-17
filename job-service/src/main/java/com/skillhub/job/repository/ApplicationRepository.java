package com.skillhub.job.repository;

import com.skillhub.job.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobId(Long jobId);
    List<Application> findByJobEmployerId(Long employerId);
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);
}
