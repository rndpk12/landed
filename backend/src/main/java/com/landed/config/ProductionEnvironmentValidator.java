package com.landed.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Base64;
import java.util.Arrays;
import java.util.List;

@Component
public class ProductionEnvironmentValidator implements ApplicationRunner {
    private final Environment environment;

    public ProductionEnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<String> profiles = Arrays.asList(environment.getActiveProfiles());
        if (!profiles.contains("prod")) {
            return;
        }

        String databaseUrl = require("DATABASE_URL");
        validateJwtSecret(require("JWT_SECRET"));
        require("GOOGLE_CLIENT_ID");
        validateCorsOrigins(require("CORS_ALLOWED_ORIGINS"));
        validateExtensionIds(environment.getProperty("CORS_ALLOWED_EXTENSION_IDS", ""));
        validateStorage();
        validateDatabaseUrl(databaseUrl);
        validateRateLimitBackend();
        validateBooleanSetting("RATE_LIMIT_ENABLED", true);
        validateBooleanSetting("SWAGGER_UI_ENABLED", false);
        validateBooleanSetting("OPENAPI_DOCS_ENABLED", false);
    }

    private String require(String name) {
        String value = environment.getProperty(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is required when SPRING_PROFILES_ACTIVE=prod");
        }
        return value.trim();
    }

    private void validateCorsOrigins(String origins) {
        boolean hasOrigin = false;
        for (String origin : origins.split(",")) {
            String value = origin.trim();
            if (value.isBlank()) {
                continue;
            }
            hasOrigin = true;
            if ("*".equals(value)) {
                throw new IllegalStateException("CORS_ALLOWED_ORIGINS cannot contain * in production");
            }
            URI uri = URI.create(value);
            if (uri.getScheme() == null || uri.getHost() == null || !uri.getScheme().equals("https")) {
                throw new IllegalStateException("CORS_ALLOWED_ORIGINS must contain absolute HTTPS origins");
            }
            if ("localhost".equalsIgnoreCase(uri.getHost()) || "127.0.0.1".equals(uri.getHost())) {
                throw new IllegalStateException("CORS_ALLOWED_ORIGINS cannot contain localhost in production");
            }
        }
        if (!hasOrigin) {
            throw new IllegalStateException("CORS_ALLOWED_ORIGINS must contain at least one production origin");
        }
    }

    private void validateDatabaseUrl(String databaseUrl) {
        String normalized = databaseUrl.toLowerCase();
        if (normalized.contains("sslmode=disable") || normalized.contains("ssl=false")) {
            throw new IllegalStateException("DATABASE_URL must require TLS in production");
        }
        String sslMode = queryParameter(databaseUrl, "sslmode");
        if (sslMode == null || !List.of("require", "verify-ca", "verify-full").contains(sslMode.toLowerCase())) {
            throw new IllegalStateException("DATABASE_URL must set sslmode=require, verify-ca, or verify-full in production");
        }
    }

    private void validateJwtSecret(String secret) {
        try {
            byte[] decoded = Base64.getDecoder().decode(secret);
            if (decoded.length < 32) {
                throw new IllegalStateException("JWT_SECRET must decode to at least 32 bytes in production");
            }
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("JWT_SECRET must be valid Base64 in production", exception);
        }
        String normalized = secret.toLowerCase();
        if (normalized.contains("replace-with") || normalized.contains("change-me") || normalized.equals("secret")) {
            throw new IllegalStateException("JWT_SECRET must not use a placeholder in production");
        }
    }

    private void validateStorage() {
        String storageType = environment.getProperty("RESUME_STORAGE_TYPE", "s3");
        if (!"s3".equalsIgnoreCase(storageType)) {
            throw new IllegalStateException("RESUME_STORAGE_TYPE must be s3 in production");
        }
        require("RESUME_STORAGE_BUCKET");
        String endpoint = environment.getProperty("RESUME_STORAGE_ENDPOINT", "").trim();
        if (!endpoint.isBlank()) {
            URI uri = URI.create(endpoint);
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null) {
                throw new IllegalStateException("RESUME_STORAGE_ENDPOINT must be an HTTPS URL in production");
            }
        }
    }

    private void validateBooleanSetting(String name, boolean expected) {
        boolean actual = Boolean.parseBoolean(environment.getProperty(name, Boolean.toString(expected)));
        if (actual != expected) {
            throw new IllegalStateException(name + " must be " + expected + " in production");
        }
    }

    private void validateRateLimitBackend() {
        String backend = environment.getProperty("RATE_LIMIT_BACKEND", "memory");
        if ("memory".equalsIgnoreCase(backend)) {
            return;
        }
        if (!"redis".equalsIgnoreCase(backend)) {
            throw new IllegalStateException("RATE_LIMIT_BACKEND must be memory or redis");
        }
        String redisUrl = require("REDIS_URL");
        URI uri = URI.create(redisUrl);
        if (!List.of("redis", "rediss").contains(uri.getScheme()) || uri.getHost() == null) {
            throw new IllegalStateException("REDIS_URL must be a redis:// or rediss:// URL in production");
        }
    }

    private String queryParameter(String value, String name) {
        int queryStart = value.indexOf('?');
        if (queryStart < 0) {
            return null;
        }
        for (String parameter : value.substring(queryStart + 1).split("&")) {
            String[] pair = parameter.split("=", 2);
            if (pair.length == 2 && pair[0].equalsIgnoreCase(name)) {
                return pair[1];
            }
        }
        return null;
    }

    private void validateExtensionIds(String extensionIds) {
        for (String extensionId : extensionIds.split(",")) {
            String value = extensionId.trim();
            if (!value.isBlank() && !value.matches("[a-p]{32}")) {
                throw new IllegalStateException("CORS_ALLOWED_EXTENSION_IDS contains an invalid Chrome extension ID");
            }
        }
    }
}
