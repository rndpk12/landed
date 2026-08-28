package com.landed.resume;

import com.landed.common.exception.BadRequestException;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ResumeStorageService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "txt");
    private final ResumeStorageBackend backend;

    public ResumeStorageService(ResumeStorageBackend backend) {
        this.backend = backend;
    }

    public StoredFile store(byte[] bytes, String originalFilename) {
        if (bytes.length == 0) throw new BadRequestException("Resume file cannot be empty");
        String filename = sanitizeFilename(originalFilename);
        String extension = extension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Supported resume formats are PDF, DOCX, and TXT");
        }
        String key = UUID.randomUUID() + "." + extension;
        backend.store(key, bytes, contentType(extension));
        return new StoredFile(key, filename, extension);
    }

    public Resource load(String key) {
        validateKey(key);
        return backend.load(key);
    }

    public void delete(String key) {
        validateKey(key);
        backend.delete(key);
    }

    private void validateKey(String key) {
        if (key == null || key.isBlank() || !Path.of(key).getFileName().toString().equals(key)) {
            throw new IllegalArgumentException("Invalid storage key");
        }
    }

    private String sanitizeFilename(String value) {
        if (value == null || value.isBlank()) throw new BadRequestException("Resume filename is required");
        String filename = Path.of(value).getFileName().toString().replaceAll("[\\r\\n\\t]", "_");
        if (filename.length() > 255) throw new BadRequestException("Resume filename is too long");
        return filename;
    }

    private String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String contentType(String extension) {
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "txt" -> "text/plain";
            default -> "application/octet-stream";
        };
    }

    public record StoredFile(String key, String originalFilename, String extension) { }
}
