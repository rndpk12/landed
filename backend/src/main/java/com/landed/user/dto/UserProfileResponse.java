package com.landed.user.dto;

import com.landed.user.User;

import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(UUID id, String name, String email, Instant createdAt) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
