package com.landed.auth;

import com.landed.auth.dto.AuthResponse;
import com.landed.auth.dto.GoogleAuthRequest;
import com.landed.auth.dto.LoginRequest;
import com.landed.auth.dto.RegisterRequest;
import com.landed.common.exception.BadRequestException;
import com.landed.common.exception.ConflictException;
import com.landed.security.JwtService;
import com.landed.user.User;
import com.landed.user.UserRepository;
import com.landed.user.dto.UserProfileResponse;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RestClient restClient;
    private final String googleClientId;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService,
                       RestClient.Builder restClientBuilder,
                       @Value("${app.google.client-id:}") String googleClientId) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.restClient = restClientBuilder.build();
        this.googleClientId = googleClientId;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = new User(request.name().trim(), email, passwordEncoder.encode(request.password()));
        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("An account with this email already exists");
        }
        return responseFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow();
        return responseFor(user);
    }

    @Transactional
    public AuthResponse google(GoogleAuthRequest request) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new BadRequestException("Google sign-in is not configured");
        }

        GoogleTokenInfo tokenInfo = verifyGoogleCredential(request.credential());
        if (!googleClientId.equals(tokenInfo.audience())) {
            throw new BadRequestException("Google sign-in credential is for a different app");
        }
        if (!Boolean.TRUE.equals(tokenInfo.emailVerified())) {
            throw new BadRequestException("Google account email is not verified");
        }

        String email = normalizeEmail(tokenInfo.email());
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> createGoogleUser(email, tokenInfo.name()));
        return responseFor(user);
    }

    private AuthResponse responseFor(User user) {
        return new AuthResponse(jwtService.generateToken(user.getEmail()), "Bearer",
                jwtService.getExpirationSeconds(), UserProfileResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private User createGoogleUser(String email, String name) {
        String displayName = name == null || name.isBlank() ? email.substring(0, email.indexOf('@')) : name.trim();
        User user = new User(displayName, email, passwordEncoder.encode(UUID.randomUUID().toString()));
        try {
            return userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            return userRepository.findByEmailIgnoreCase(email).orElseThrow();
        }
    }

    private GoogleTokenInfo verifyGoogleCredential(String credential) {
        if (credential.chars().filter(character -> character == '.').count() == 2) {
            return verifyGoogleIdToken(credential);
        }

        return verifyGoogleAccessToken(credential);
    }

    private GoogleTokenInfo verifyGoogleIdToken(String credential) {
        try {
            var uri = UriComponentsBuilder.fromUriString("https://oauth2.googleapis.com/tokeninfo")
                    .queryParam("id_token", credential)
                    .build()
                    .toUri();
            GoogleTokenInfo tokenInfo = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(GoogleTokenInfo.class);

            if (tokenInfo == null || tokenInfo.email() == null || tokenInfo.email().isBlank()) {
                throw new BadRequestException("Google did not return an email address");
            }

            return tokenInfo;
        } catch (RestClientException exception) {
            throw new BadRequestException("Google sign-in credential could not be verified", exception);
        }
    }

    private GoogleTokenInfo verifyGoogleAccessToken(String credential) {
        try {
            var tokenInfoUri = UriComponentsBuilder.fromUriString("https://oauth2.googleapis.com/tokeninfo")
                    .queryParam("access_token", credential)
                    .build()
                    .toUri();
            GoogleAccessTokenInfo tokenInfo = restClient.get()
                    .uri(tokenInfoUri)
                    .retrieve()
                    .body(GoogleAccessTokenInfo.class);

            GoogleUserInfo userInfo = restClient.get()
                    .uri("https://openidconnect.googleapis.com/v1/userinfo")
                    .header("Authorization", "Bearer " + credential)
                    .retrieve()
                    .body(GoogleUserInfo.class);

            if (tokenInfo == null || userInfo == null || userInfo.email() == null || userInfo.email().isBlank()) {
                throw new BadRequestException("Google did not return an email address");
            }

            Boolean emailVerified = userInfo.emailVerified() != null
                    ? userInfo.emailVerified()
                    : tokenInfo.emailVerified();
            return new GoogleTokenInfo(tokenInfo.audience(), userInfo.email(), emailVerified, userInfo.name());
        } catch (RestClientException exception) {
            throw new BadRequestException("Google sign-in credential could not be verified", exception);
        }
    }

    private record GoogleTokenInfo(
            @JsonProperty("aud") String audience,
            String email,
            @JsonProperty("email_verified") Boolean emailVerified,
            String name
    ) {
    }

    private record GoogleAccessTokenInfo(
            @JsonProperty("audience") @JsonAlias({"aud", "issued_to"}) String audience,
            @JsonProperty("verified_email") @JsonAlias("email_verified") Boolean emailVerified
    ) {
    }

    private record GoogleUserInfo(
            String email,
            @JsonProperty("email_verified") Boolean emailVerified,
            String name
    ) {
    }
}
