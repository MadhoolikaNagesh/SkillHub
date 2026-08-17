package com.skillhub.user.dto;

import com.skillhub.user.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username/Email is required")
    @Email(message = "Username must be a valid email")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Role is required")
    private Role role;

    // Candidate metadata
    private String title;
    private String skills;
    private String resumeUrl;

    // Employer metadata
    private String companyName;
    private String companyWebsite;
    private String companyDescription;
}
