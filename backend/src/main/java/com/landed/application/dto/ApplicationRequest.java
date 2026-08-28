package com.landed.application.dto;

import com.landed.application.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;
import java.util.UUID;

public record ApplicationRequest(
        @NotBlank @Size(max = 150) String company,
        @NotBlank @Size(max = 150) String role,
        @URL @Size(max = 2048) String jobUrl,
        @Size(max = 150) String location,
        @Size(max = 50000) String jobDescription,
        @Size(max = 50) String employmentType,
        UUID resumeVersionId,
        @NotNull ApplicationStatus status,
        @Size(max = 10000) String notes,
        LocalDate appliedDate
) {
}
