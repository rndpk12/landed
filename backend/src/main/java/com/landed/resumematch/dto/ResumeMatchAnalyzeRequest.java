package com.landed.resumematch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ResumeMatchAnalyzeRequest(
        @NotNull UUID resumeId,
        @NotBlank @Size(max = 50000) String jobDescription
) {
}
