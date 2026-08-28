package com.landed.application.dto;

import com.landed.application.ApplicationStageEvent;
import com.landed.application.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record StageEventResponse(UUID id, ApplicationStatus fromStatus, ApplicationStatus toStatus,
                                 String notes, Instant occurredAt) {
    public static StageEventResponse from(ApplicationStageEvent event) {
        return new StageEventResponse(event.getId(), event.getFromStatus(), event.getToStatus(),
                event.getNotes(), event.getOccurredAt());
    }
}
