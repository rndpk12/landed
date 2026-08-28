package com.landed.application.dto;

import com.landed.application.ApplicationStageNote;
import com.landed.application.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record StageNoteResponse(UUID id, ApplicationStatus status, String content,
                                Instant createdAt, Instant updatedAt) {
    public static StageNoteResponse from(ApplicationStageNote note) {
        return new StageNoteResponse(note.getId(), note.getStatus(), note.getContent(),
                note.getCreatedAt(), note.getUpdatedAt());
    }
}
