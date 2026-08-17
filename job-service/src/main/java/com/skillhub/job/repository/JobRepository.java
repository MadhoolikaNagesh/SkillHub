package com.skillhub.job.repository;

import com.skillhub.job.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByEmployerId(Long employerId);

    @Query(value = "SELECT * FROM jobs j WHERE " +
           "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', CAST(:title AS text), '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', CAST(:location AS text), '%')))",
           nativeQuery = true)
    List<Job> searchJobs(@Param("title") String title, @Param("location") String location);
}
