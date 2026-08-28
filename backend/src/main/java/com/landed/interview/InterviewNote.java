package com.landed.interview;

import com.landed.application.JobApplication;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "interview_notes")
public class InterviewNote {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(name = "round_number", nullable = false)
    private int roundNumber;

    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Column(name = "questions_asked", columnDefinition = "TEXT")
    private String questionsAsked;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 150)
    private String outcome;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected InterviewNote() {
    }

    public InterviewNote(JobApplication application, int roundNumber, LocalDate interviewDate,
                         String questionsAsked, String notes, String outcome) {
        this.id = UUID.randomUUID();
        this.application = application;
        update(roundNumber, interviewDate, questionsAsked, notes, outcome);
    }

    public void update(int roundNumber, LocalDate interviewDate, String questionsAsked, String notes, String outcome) {
        this.roundNumber = roundNumber;
        this.interviewDate = interviewDate;
        this.questionsAsked = questionsAsked;
        this.notes = notes;
        this.outcome = outcome;
        this.updatedAt = Instant.now();
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
    public JobApplication getApplication() { return application; }
    public int getRoundNumber() { return roundNumber; }
    public LocalDate getInterviewDate() { return interviewDate; }
    public String getQuestionsAsked() { return questionsAsked; }
    public String getNotes() { return notes; }
    public String getOutcome() { return outcome; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
