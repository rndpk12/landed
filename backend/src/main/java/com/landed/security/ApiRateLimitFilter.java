package com.landed.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ApiRateLimitFilter extends OncePerRequestFilter {
    private static final long WINDOW_SECONDS = 60;

    private final boolean enabled;
    private final int authLimit;
    private final int heavyLimit;
    private final int generalLimit;
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();
    private final AtomicLong requests = new AtomicLong();

    public ApiRateLimitFilter(
            @Value("${app.rate-limit.enabled:true}") boolean enabled,
            @Value("${app.rate-limit.auth-per-minute:10}") int authLimit,
            @Value("${app.rate-limit.heavy-per-minute:20}") int heavyLimit,
            @Value("${app.rate-limit.general-per-minute:180}") int generalLimit) {
        this.enabled = enabled;
        this.authLimit = authLimit;
        this.heavyLimit = heavyLimit;
        this.generalLimit = generalLimit;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !enabled || "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Bucket bucket = bucketFor(request);
        long window = Instant.now().getEpochSecond() / WINDOW_SECONDS;
        String key = bucket.name() + ':' + clientKey(request) + ':' + window;
        WindowCounter counter = counters.compute(key, (ignored, current) -> {
            if (current == null) return new WindowCounter(window, new AtomicInteger(1));
            current.count().incrementAndGet();
            return current;
        });

        if (requests.incrementAndGet() % 1_000 == 0) {
            counters.entrySet().removeIf(entry -> entry.getValue().window() < window - 1);
        }

        if (counter.count().get() > bucket.limit()) {
            long retryAfter = WINDOW_SECONDS - (Instant.now().getEpochSecond() % WINDOW_SECONDS);
            response.setStatus(429);
            response.setHeader("Retry-After", Long.toString(retryAfter));
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.getWriter().write("{\"status\":429,\"message\":\"Too many requests. Please try again shortly.\"}");
            return;
        }

        response.setHeader("X-RateLimit-Limit", Integer.toString(bucket.limit()));
        response.setHeader("X-RateLimit-Remaining", Integer.toString(Math.max(0, bucket.limit() - counter.count().get())));
        chain.doFilter(request, response);
    }

    private Bucket bucketFor(HttpServletRequest request) {
        String path = request.getRequestURI();
        if ("POST".equalsIgnoreCase(request.getMethod()) && path.startsWith("/api/v1/auth/")) {
            return new Bucket("auth", authLimit);
        }
        if ("POST".equalsIgnoreCase(request.getMethod())
                && (path.startsWith("/api/v1/resumes")
                || path.startsWith("/api/v1/resume-match")
                || path.startsWith("/api/v1/job-import"))) {
            return new Bucket("heavy", heavyLimit);
        }
        return new Bucket("general", generalLimit);
    }

    private String clientKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            return "user:" + authentication.getName();
        }
        return "ip:" + request.getRemoteAddr();
    }

    private record Bucket(String name, int limit) { }

    private record WindowCounter(long window, AtomicInteger count) { }
}
