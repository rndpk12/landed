package com.landed.resume.dto;

import com.landed.resume.Resume;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record ResumeResponse(UUID id, String name, Set<String> tags, int applicationCount,
                             List<ResumeVersionResponse> versions, Instant createdAt, Instant updatedAt) {
    public static ResumeResponse from(Resume resume, int applicationCount) {
        return new ResumeResponse(resume.getId(), resume.getName(), resume.getTags(), applicationCount,
                resume.getVersions().stream().map(ResumeVersionResponse::from).toList(),
                resume.getCreatedAt(), resume.getUpdatedAt());
    }
}
