package com.landed.interview.dto;

import com.landed.interview.InterviewNote;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InterviewNoteResponse(
        UUID id,
        UUID applicationId,
        int roundNumber,
        LocalDate interviewDate,
        String questionsAsked,
        String notes,
        String outcome,
        Instant createdAt,
        Instant updatedAt
) {
    public static InterviewNoteResponse from(InterviewNote note) {
        return new InterviewNoteResponse(note.getId(), note.getApplication().getId(), note.getRoundNumber(),
                note.getInterviewDate(), note.getQuestionsAsked(), note.getNotes(), note.getOutcome(),
                note.getCreatedAt(), note.getUpdatedAt());
    }
}
