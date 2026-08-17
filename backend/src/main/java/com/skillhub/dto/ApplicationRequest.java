package com.skillhub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplicationRequest {
    private String resumeUrl;

    @NotBlank(message = "Cover letter is required")
    private String coverLetter;
}
