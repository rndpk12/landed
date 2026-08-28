package com.landed.resume;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, UUID> {
    Optional<ResumeVersion> findByIdAndResumeUserId(UUID id, UUID userId);
    int countByResumeId(UUID resumeId);
    Optional<ResumeVersion> findTopByResumeIdOrderByVersionNumberDesc(UUID resumeId);

    long countByProcessingStatus(ResumeProcessingStatus processingStatus);
}
