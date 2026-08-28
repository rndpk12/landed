package com.landed.resume.dto;

import com.landed.resume.ResumeVersion;

import java.time.Instant;
import java.util.UUID;

public record ResumeVersionResponse(UUID id, int version, String filename, String contentType,
                                    long fileSize, String sha256, String processingStatus,
                                    String processingError, Instant createdAt) {
    public static ResumeVersionResponse from(ResumeVersion version) {
        return new ResumeVersionResponse(version.getId(), version.getVersionNumber(), version.getOriginalFilename(),
                version.getContentType(), version.getFileSize(), version.getSha256(),
                version.getProcessingStatus().name(), version.getProcessingError(), version.getCreatedAt());
    }
}
