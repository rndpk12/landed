package com.landed.feedback;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lite_feedback")
public class LiteFeedback {
    @Id
    private UUID id;

    @Column(nullable = false, length = 30)
    private String category;

    @Column(nullable = false, length = 4_000)
    private String message;

    @Column(length = 255)
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected LiteFeedback() { }

    public LiteFeedback(String category, String message, String email) {
        this.id = UUID.randomUUID();
        this.category = category;
        this.message = message;
        this.email = email == null || email.isBlank() ? null : email;
        this.createdAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }
}
