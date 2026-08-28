package com.landed.resume.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record ResumeMetadataRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 20) Set<@NotBlank @Size(max = 50) String> tags
) {
}
