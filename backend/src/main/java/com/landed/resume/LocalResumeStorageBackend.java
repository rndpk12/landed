package com.landed.resume;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@Component
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
class LocalResumeStorageBackend implements ResumeStorageBackend {
    private final Path root;

    LocalResumeStorageBackend(@Value("${app.storage.resume-directory}") String directory) {
        this.root = Path.of(directory).toAbsolutePath().normalize();
    }

    @PostConstruct
    void initialize() {
        try {
            Files.createDirectories(root);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not initialize resume storage", exception);
        }
    }

    @Override
    public void store(String key, byte[] bytes, String contentType) {
        try {
            Files.write(resolve(key), bytes, StandardOpenOption.CREATE_NEW);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not store resume file", exception);
        }
    }

    @Override
    public Resource load(String key) {
        try {
            Resource resource = new UrlResource(resolve(key).toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalStateException("Stored resume file is unavailable");
            }
            return resource;
        } catch (MalformedURLException exception) {
            throw new IllegalStateException("Stored resume path is invalid", exception);
        }
    }

    @Override
    public void delete(String key) {
        try {
            Files.deleteIfExists(resolve(key));
        } catch (IOException exception) {
            throw new IllegalStateException("Could not delete stored resume", exception);
        }
    }

    private Path resolve(String key) {
        Path path = root.resolve(key).normalize();
        if (!path.startsWith(root)) throw new IllegalArgumentException("Invalid storage key");
        return path;
    }
}
