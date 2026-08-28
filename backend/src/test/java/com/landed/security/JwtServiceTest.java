package com.landed.security;

import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {
    private final JwtService jwtService = new JwtService(
            Base64.getEncoder().encodeToString("a-secure-test-key-with-at-least-32-bytes".getBytes()), 60_000);

    @Test
    void generatesAndValidatesToken() {
        String token = jwtService.generateToken("user@example.com");

        assertThat(jwtService.extractSubject(token)).isEqualTo("user@example.com");
        assertThat(jwtService.isValid(token, "user@example.com")).isTrue();
        assertThat(jwtService.isValid(token, "other@example.com")).isFalse();
        assertThat(jwtService.getExpirationSeconds()).isEqualTo(60);
    }
}
