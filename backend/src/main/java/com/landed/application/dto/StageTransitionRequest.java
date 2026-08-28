package com.landed.application.dto;

import com.landed.application.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record StageTransitionRequest(
        @NotNull ApplicationStatus status,
        @Size(max = 10000) String notes,
        @PastOrPresent Instant occurredAt
) { }
