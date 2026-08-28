package com.landed.activity.dto;

import com.landed.activity.Activity;
import com.landed.activity.ActivityType;

import java.time.Instant;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        ActivityType type,
        String title,
        String description,
        UUID entityId,
        Instant occurredAt
) {
    public static ActivityResponse from(Activity activity) {
        return new ActivityResponse(activity.getId(), activity.getType(), activity.getTitle(),
                activity.getDescription(), activity.getEntityId(), activity.getOccurredAt());
    }
}
