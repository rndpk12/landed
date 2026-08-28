package com.landed.resume;

import com.landed.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "resumes")
public class Resume {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String name;

    @ElementCollection
    @CollectionTable(name = "resume_tags", joinColumns = @JoinColumn(name = "resume_id"))
    @Column(name = "tag", nullable = false, length = 50)
    private Set<String> tags = new LinkedHashSet<>();

    @OneToMany(mappedBy = "resume", orphanRemoval = true)
    @OrderBy("versionNumber DESC")
    private List<ResumeVersion> versions = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Resume() {
    }

    public Resume(User user, String name, Set<String> tags) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.name = name;
        this.tags.addAll(tags);
    }

    public void updateMetadata(String name, Set<String> tags) {
        this.name = name;
        this.tags.clear();
        this.tags.addAll(tags);
        this.updatedAt = Instant.now();
    }

    public void touch() {
        this.updatedAt = Instant.now();
    }

    public void addVersion(ResumeVersion version) {
        versions.add(0, version);
        touch();
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public String getName() { return name; }
    public Set<String> getTags() { return Set.copyOf(tags); }
    public List<ResumeVersion> getVersions() { return List.copyOf(versions); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
