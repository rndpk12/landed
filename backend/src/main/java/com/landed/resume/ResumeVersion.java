package com.landed.resume;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resume_versions")
public class ResumeVersion {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private long fileSize;

    @Column(name = "storage_key", nullable = false, unique = true, length = 255)
    private String storageKey;

    @Column(nullable = false, length = 64)
    private String sha256;

    @Column(name = "text_content", nullable = false, columnDefinition = "TEXT")
    private String textContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false, length = 20)
    private ResumeProcessingStatus processingStatus;

    @Column(name = "processing_error", length = 500)
    private String processingError;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ResumeVersion() {
    }

    public ResumeVersion(Resume resume, int versionNumber, String originalFilename, String contentType,
                         long fileSize, String storageKey, String sha256, String textContent) {
        this.id = UUID.randomUUID();
        this.resume = resume;
        this.versionNumber = versionNumber;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.storageKey = storageKey;
        this.sha256 = sha256;
        this.textContent = textContent == null ? "" : textContent;
        this.processingStatus = this.textContent.isBlank()
                ? ResumeProcessingStatus.PENDING
                : ResumeProcessingStatus.READY;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (processingStatus == null) processingStatus = ResumeProcessingStatus.PENDING;
    }

    public void markReady(String extractedText) {
        this.textContent = extractedText;
        this.processingStatus = ResumeProcessingStatus.READY;
        this.processingError = null;
    }

    public void markFailed(String message) {
        this.textContent = "";
        this.processingStatus = ResumeProcessingStatus.FAILED;
        this.processingError = message == null ? "Resume processing failed" : message.substring(0, Math.min(500, message.length()));
    }

    public UUID getId() { return id; }
    public Resume getResume() { return resume; }
    public int getVersionNumber() { return versionNumber; }
    public String getOriginalFilename() { return originalFilename; }
    public String getContentType() { return contentType; }
    public long getFileSize() { return fileSize; }
    public String getStorageKey() { return storageKey; }
    public String getSha256() { return sha256; }
    public String getTextContent() { return textContent; }
    public ResumeProcessingStatus getProcessingStatus() { return processingStatus; }
    public String getProcessingError() { return processingError; }
    public Instant getCreatedAt() { return createdAt; }
}
