package com.landed.user;

import com.landed.user.dto.UpdateProfileRequest;
import com.landed.user.dto.UserProfileResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get the current user's profile")
    public UserProfileResponse currentUser(Authentication authentication) {
        return userService.getProfile(authentication.getName());
    }

    @PutMapping("/me")
    @Operation(summary = "Update the current user's profile")
    public UserProfileResponse updateProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(authentication.getName(), request);
    }
}
