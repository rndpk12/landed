package com.landed.interview.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record InterviewNoteRequest(
        @Min(1) @Max(20) int roundNumber,
        LocalDate interviewDate,
        @Size(max = 20000) String questionsAsked,
        @Size(max = 20000) String notes,
        @Size(max = 150) String outcome
) {
}
