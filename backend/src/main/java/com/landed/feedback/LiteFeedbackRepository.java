package com.landed.feedback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LiteFeedbackRepository extends JpaRepository<LiteFeedback, UUID> { }
