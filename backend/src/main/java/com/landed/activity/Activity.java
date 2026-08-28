package com.landed.activity;

import com.landed.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "activities")
public class Activity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ActivityType type;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;

    protected Activity() {
    }

    public Activity(User user, ActivityType type, String title, String description, UUID entityId) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.type = type;
        this.title = title;
        this.description = description;
        this.entityId = entityId;
        this.occurredAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (occurredAt == null) occurredAt = Instant.now();
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public ActivityType getType() { return type; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public UUID getEntityId() { return entityId; }
    public Instant getOccurredAt() { return occurredAt; }
}
