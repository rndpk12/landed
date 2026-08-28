package com.landed.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        Map<String, Object> properties = new HashMap<>();
        if (databaseUrl.startsWith("jdbc:")) {
            properties.put("spring.datasource.url", databaseUrl);
        } else {
            URI uri = URI.create(databaseUrl);
            String scheme = uri.getScheme();
            if (!"postgres".equalsIgnoreCase(scheme) && !"postgresql".equalsIgnoreCase(scheme)) {
                throw new IllegalArgumentException("DATABASE_URL must use postgres:// or postgresql://");
            }

            String userInfo = uri.getUserInfo();
            if (userInfo != null && !userInfo.isBlank()) {
                String[] credentials = userInfo.split(":", 2);
                properties.put("spring.datasource.username", decode(credentials[0]));
                if (credentials.length > 1) {
                    properties.put("spring.datasource.password", decode(credentials[1]));
                }
            }

            StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                    .append(uri.getHost());
            if (uri.getPort() > 0) {
                jdbcUrl.append(':').append(uri.getPort());
            }
            jdbcUrl.append(uri.getPath() == null || uri.getPath().isBlank() ? "/" : uri.getPath());
            if (uri.getQuery() == null || uri.getQuery().isBlank()) {
                jdbcUrl.append("?sslmode=require");
            } else {
                jdbcUrl.append('?').append(uri.getQuery());
                if (!uri.getQuery().contains("sslmode=")) {
                    jdbcUrl.append("&sslmode=require");
                }
            }
            properties.put("spring.datasource.url", jdbcUrl.toString());
        }

        environment.getPropertySources().addFirst(new MapPropertySource("databaseUrl", properties));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
