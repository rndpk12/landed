package com.landed.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.mock.env.MockEnvironment;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductionEnvironmentValidatorTest {
    @Test
    void acceptsSecureProductionConfiguration() {
        MockEnvironment environment = secureEnvironment();

        assertThatCode(() -> new ProductionEnvironmentValidator(environment)
                .run(new DefaultApplicationArguments())).doesNotThrowAnyException();
    }

    @Test
    void rejectsProductionWithDisabledRateLimiting() {
        MockEnvironment environment = secureEnvironment().withProperty("RATE_LIMIT_ENABLED", "false");

        assertThatThrownBy(() -> new ProductionEnvironmentValidator(environment)
                .run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("RATE_LIMIT_ENABLED");
    }

    @Test
    void acceptsRedisRateLimitBackendWithRedisUrl() {
        MockEnvironment environment = secureEnvironment()
                .withProperty("RATE_LIMIT_BACKEND", "redis")
                .withProperty("REDIS_URL", "rediss://redis.example.com:6379");

        assertThatCode(() -> new ProductionEnvironmentValidator(environment)
                .run(new DefaultApplicationArguments())).doesNotThrowAnyException();
    }

    private MockEnvironment secureEnvironment() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");
        return environment
                .withProperty("DATABASE_URL", "postgresql://db.example.com:5432/landed?sslmode=require")
                .withProperty("JWT_SECRET", Base64.getEncoder().encodeToString(new byte[32]))
                .withProperty("GOOGLE_CLIENT_ID", "client-id")
                .withProperty("CORS_ALLOWED_ORIGINS", "https://app.example.com")
                .withProperty("CORS_ALLOWED_EXTENSION_IDS", "")
                .withProperty("RESUME_STORAGE_TYPE", "s3")
                .withProperty("RESUME_STORAGE_BUCKET", "landed-resumes")
                .withProperty("RATE_LIMIT_ENABLED", "true")
                .withProperty("SWAGGER_UI_ENABLED", "false")
                .withProperty("OPENAPI_DOCS_ENABLED", "false");
    }
}
