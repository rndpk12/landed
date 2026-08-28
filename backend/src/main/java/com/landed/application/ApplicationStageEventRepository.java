package com.landed.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ApplicationStageEventRepository extends JpaRepository<ApplicationStageEvent, UUID> {
    List<ApplicationStageEvent> findByApplicationIdOrderByOccurredAtDesc(UUID applicationId);
}
