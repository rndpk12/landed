package com.landed.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.URI;
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

        require("DATABASE_URL");
        require("JWT_SECRET");
        validateCorsOrigins(require("CORS_ALLOWED_ORIGINS"));
        if ("s3".equalsIgnoreCase(environment.getProperty("RESUME_STORAGE_TYPE", "s3"))) {
            require("RESUME_STORAGE_BUCKET");
        }
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
}
