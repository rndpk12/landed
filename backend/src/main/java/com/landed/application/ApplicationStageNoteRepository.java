package com.landed.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationStageNoteRepository extends JpaRepository<ApplicationStageNote, UUID> {
    List<ApplicationStageNote> findByApplicationIdOrderByCreatedAtDesc(UUID applicationId);
    Optional<ApplicationStageNote> findByIdAndApplicationUserId(UUID id, UUID userId);
}
