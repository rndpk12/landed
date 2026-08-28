package com.landed.resume;

import org.springframework.core.io.Resource;

interface ResumeStorageBackend {
    void store(String key, byte[] bytes, String contentType);

    Resource load(String key);

    void delete(String key);
}
