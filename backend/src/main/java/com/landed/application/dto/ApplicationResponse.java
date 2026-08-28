package com.landed.application.dto;

import com.landed.application.ApplicationStatus;
import com.landed.application.JobApplication;
import com.landed.resume.dto.ResumeVersionResponse;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ApplicationResponse(
        UUID id,
        String company,
        String role,
        String jobUrl,
        String location,
        String jobDescription,
        String employmentType,
        ResumeVersionResponse resumeVersion,
        ApplicationStatus status,
        String notes,
        LocalDate appliedDate,
        Instant createdAt
) {
    public static ApplicationResponse from(JobApplication application) {
        return new ApplicationResponse(application.getId(), application.getCompany(), application.getRole(),
                application.getJobUrl(), application.getLocation(), application.getJobDescription(),
                application.getEmploymentType(), application.getResumeVersion() == null ? null
                : ResumeVersionResponse.from(application.getResumeVersion()), application.getStatus(), application.getNotes(),
                application.getAppliedDate(), application.getCreatedAt());
    }
}
