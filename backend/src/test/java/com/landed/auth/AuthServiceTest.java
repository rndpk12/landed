package com.landed.auth;

import com.landed.auth.dto.RegisterRequest;
import com.landed.common.exception.ConflictException;
import com.landed.security.JwtService;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository, passwordEncoder, authenticationManager, jwtService, RestClient.builder(), "google-client-id");
    }

    @Test
    void registersUserWithNormalizedEmailAndEncodedPassword() {
        when(userRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken("user@example.com")).thenReturn("jwt");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        var response = authService.register(new RegisterRequest("Jane", " User@Example.COM ", "password123"));

        assertThat(response.token()).isEqualTo("jwt");
        assertThat(response.user().email()).isEqualTo("user@example.com");
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void rejectsExistingEmail() {
        when(userRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("Jane", "user@example.com", "password123")))
                .isInstanceOf(ConflictException.class);
    }
}
