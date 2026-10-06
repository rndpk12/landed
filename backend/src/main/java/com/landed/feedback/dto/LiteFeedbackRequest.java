package com.landed.feedback.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LiteFeedbackRequest(
        @NotBlank @Pattern(regexp = "feedback|feature|review", message = "Choose feedback, feature, or review") String category,
        @NotBlank @Size(max = 4_000) String message,
        @Email @Size(max = 255) String email
) { }
