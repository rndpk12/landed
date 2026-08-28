package com.landed.application.dto;

import com.landed.application.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StageNoteRequest(
        @NotNull ApplicationStatus status,
        @NotBlank @Size(max = 10000) String content
) { }
