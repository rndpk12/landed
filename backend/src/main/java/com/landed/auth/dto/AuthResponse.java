package com.landed.auth.dto;

import com.landed.user.dto.UserProfileResponse;

public record AuthResponse(String token, String tokenType, long expiresIn, UserProfileResponse user) {
}
