package com.skillhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalUsers;
    private long totalCandidates;
    private long totalEmployers;
    private long totalJobs;
    private long totalApplications;
}
