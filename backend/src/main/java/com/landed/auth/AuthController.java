package com.landed.auth;

import com.landed.auth.dto.AuthResponse;
import com.landed.auth.dto.GoogleAuthRequest;
import com.landed.auth.dto.GoogleClientConfigResponse;
import com.landed.auth.dto.LoginRequest;
import com.landed.auth.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Value;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final String googleClientId;

    public AuthController(AuthService authService,
                          @Value("${app.google.client-id:}") String googleClientId) {
        this.authService = authService;
        this.googleClientId = googleClientId;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Log in and receive a JWT")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    @Operation(summary = "Sign in with Google and receive a JWT")
    public AuthResponse google(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.google(request);
    }

    @GetMapping("/google/config")
    @Operation(summary = "Get public Google sign-in configuration")
    public GoogleClientConfigResponse googleConfig() {
        return new GoogleClientConfigResponse(googleClientId == null ? "" : googleClientId);
    }
}
