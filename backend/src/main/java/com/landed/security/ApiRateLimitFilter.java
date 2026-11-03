package com.landed.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
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
    private static final Logger log = LoggerFactory.getLogger(ApiRateLimitFilter.class);

    private final boolean enabled;
    private final int authLimit;
    private final int heavyLimit;
    private final int generalLimit;
    private final boolean redisBackend;
    private final ObjectProvider<RedisRateLimitStore> redisStoreProvider;
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();
    private final AtomicLong requests = new AtomicLong();

    public ApiRateLimitFilter(
            @Value("${app.rate-limit.enabled:true}") boolean enabled,
            @Value("${app.rate-limit.auth-per-minute:10}") int authLimit,
            @Value("${app.rate-limit.heavy-per-minute:20}") int heavyLimit,
            @Value("${app.rate-limit.general-per-minute:180}") int generalLimit,
            @Value("${app.rate-limit.backend:memory}") String backend,
            ObjectProvider<RedisRateLimitStore> redisStoreProvider) {
        this.enabled = enabled;
        this.authLimit = authLimit;
        this.heavyLimit = heavyLimit;
        this.generalLimit = generalLimit;
        this.redisBackend = "redis".equalsIgnoreCase(backend);
        this.redisStoreProvider = redisStoreProvider;
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
        String client = clientKey(request);
        long count;
        if (redisBackend) {
            RedisRateLimitStore redisStore = redisStoreProvider.getIfAvailable();
            if (redisStore == null) {
                rejectUnavailable(response);
                return;
            }
            try {
                count = redisStore.increment(bucket.name(), client, window, WINDOW_SECONDS + 1);
            } catch (RuntimeException exception) {
                log.error("Redis rate-limit backend unavailable requestId={}",
                        RequestCorrelationFilter.requestId(request), exception);
                rejectUnavailable(response);
                return;
            }
        } else {
            count = incrementInMemory(bucket, client, window);
        }

        if (count > bucket.limit()) {
            long retryAfter = WINDOW_SECONDS - (Instant.now().getEpochSecond() % WINDOW_SECONDS);
            response.setStatus(429);
            response.setHeader("Retry-After", Long.toString(retryAfter));
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.getWriter().write("{\"status\":429,\"message\":\"Too many requests. Please try again shortly.\"}");
            return;
        }

        response.setHeader("X-RateLimit-Limit", Integer.toString(bucket.limit()));
        response.setHeader("X-RateLimit-Remaining", Long.toString(Math.max(0L, bucket.limit() - count)));
        chain.doFilter(request, response);
    }

    private long incrementInMemory(Bucket bucket, String client, long window) {
        String key = bucket.name() + ':' + client + ':' + window;
        WindowCounter counter = counters.compute(key, (ignored, current) -> {
            if (current == null) return new WindowCounter(window, new AtomicInteger(1));
            current.count().incrementAndGet();
            return current;
        });
        if (requests.incrementAndGet() % 1_000 == 0) {
            counters.entrySet().removeIf(entry -> entry.getValue().window() < window - 1);
        }
        return counter.count().get();
    }

    private void rejectUnavailable(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        response.setHeader("Retry-After", "30");
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.getWriter().write("{\"status\":503,\"message\":\"Rate-limit service unavailable. Please retry shortly.\"}");
    }

    private Bucket bucketFor(HttpServletRequest request) {
        String path = request.getRequestURI();
        if ("POST".equalsIgnoreCase(request.getMethod()) && path.startsWith("/api/v1/auth/")) {
            return new Bucket("auth", authLimit);
        }
        if ("POST".equalsIgnoreCase(request.getMethod())
                && (path.startsWith("/api/v1/resumes")
                || path.startsWith("/api/v1/resume-match")
                || path.startsWith("/api/v1/job-import")
                || path.startsWith("/api/v1/lite/job-import")
                || path.startsWith("/api/v1/lite/feedback"))) {
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
