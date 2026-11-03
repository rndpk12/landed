package com.landed.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.util.List;

/** Atomic fixed-window counter shared by all backend instances. */
@Component
@ConditionalOnProperty(name = "app.rate-limit.backend", havingValue = "redis")
public class RedisRateLimitStore {
    private static final DefaultRedisScript<Long> INCREMENT_SCRIPT = new DefaultRedisScript<>(
            "local current = redis.call('INCR', KEYS[1]) " +
                    "if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end " +
                    "return current",
            Long.class);

    private final StringRedisTemplate redisTemplate;

    public RedisRateLimitStore(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public long increment(String bucket, String client, long window, long ttlSeconds) {
        String key = "landed:rate-limit:" + bucket + ":" + client + ":" + window;
        Long count = redisTemplate.execute(INCREMENT_SCRIPT, List.of(key), Long.toString(ttlSeconds));
        if (count == null) {
            throw new IllegalStateException("Redis returned no rate-limit count");
        }
        return count;
    }
}
