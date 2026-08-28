package com.landed.interview;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewNoteRepository extends JpaRepository<InterviewNote, UUID> {
    List<InterviewNote> findByApplicationIdAndApplicationUserIdOrderByRoundNumberAscCreatedAtAsc(UUID applicationId, UUID userId);

    Optional<InterviewNote> findByIdAndApplicationUserId(UUID id, UUID userId);
}
