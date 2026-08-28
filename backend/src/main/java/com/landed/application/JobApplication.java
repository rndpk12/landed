package com.landed.application;

import com.landed.user.User;
import com.landed.resume.ResumeVersion;
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
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(nullable = false, length = 150)
    private String role;

    @Column(name = "job_url", length = 2048)
    private String jobUrl;

    @Column(length = 150)
    private String location;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "employment_type", length = 50)
    private String employmentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_version_id")
    private ResumeVersion resumeVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected JobApplication() {
    }

    public JobApplication(User user, String company, String role, String jobUrl, String location,
                          String jobDescription, String employmentType, ResumeVersion resumeVersion,
                          ApplicationStatus status, String notes, LocalDate appliedDate) {
        this.id = UUID.randomUUID();
        this.user = user;
        update(company, role, jobUrl, location, jobDescription, employmentType, resumeVersion,
                status, notes, appliedDate);
    }

    public JobApplication(User user, String company, String role, String jobUrl,
                          ApplicationStatus status, String notes, LocalDate appliedDate) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.company = company;
        this.role = role;
        this.jobUrl = jobUrl;
        this.status = status;
        this.notes = notes;
        this.appliedDate = appliedDate;
    }

    public void update(String company, String role, String jobUrl, String location, String jobDescription,
                       String employmentType, ResumeVersion resumeVersion, ApplicationStatus status,
                       String notes, LocalDate appliedDate) {
        this.company = company;
        this.role = role;
        this.jobUrl = jobUrl;
        this.location = location;
        this.jobDescription = jobDescription;
        this.employmentType = employmentType;
        this.resumeVersion = resumeVersion;
        this.status = status;
        this.notes = notes;
        this.appliedDate = appliedDate;
    }

    public void update(String company, String role, String jobUrl, ApplicationStatus status,
                       String notes, LocalDate appliedDate) {
        this.company = company;
        this.role = role;
        this.jobUrl = jobUrl;
        this.status = status;
        this.notes = notes;
        this.appliedDate = appliedDate;
    }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public String getCompany() { return company; }
    public String getRole() { return role; }
    public String getJobUrl() { return jobUrl; }
    public String getLocation() { return location; }
    public String getJobDescription() { return jobDescription; }
    public String getEmploymentType() { return employmentType; }
    public ResumeVersion getResumeVersion() { return resumeVersion; }
    public ApplicationStatus getStatus() { return status; }
    public String getNotes() { return notes; }
    public LocalDate getAppliedDate() { return appliedDate; }
    public Instant getCreatedAt() { return createdAt; }
}
