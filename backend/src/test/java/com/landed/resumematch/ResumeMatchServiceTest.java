package com.landed.resumematch;

import com.landed.activity.ActivityService;
import com.landed.common.exception.BadRequestException;
import com.landed.common.exception.ResourceNotFoundException;
import com.landed.resume.Resume;
import com.landed.resume.ResumeRepository;
import com.landed.resume.ResumeVersion;
import com.landed.resumematch.dto.ResumeMatchAnalyzeRequest;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResumeMatchServiceTest {
    @Mock ResumeRepository resumeRepository;
    @Mock UserRepository userRepository;
    @Mock ActivityService activityService;

    private ResumeMatchService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new ResumeMatchService(resumeRepository, userRepository, activityService);
        user = new User("Jane", "jane@example.com", "encoded");
    }

    @Test
    void analyzesStoredResumeAgainstJobDescription() {
        Resume resume = resumeWithText("Backend Resume",
                "Java Spring Boot PostgreSQL Redis AWS Docker microservices latency performance APIs ownership");
        UUID resumeId = resume.getId();
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(resumeRepository.findDistinctByIdAndUserId(resumeId, user.getId())).thenReturn(Optional.of(resume));

        var response = service.analyze("jane@example.com", new ResumeMatchAnalyzeRequest(resumeId,
                "We need Java Spring Boot AWS PostgreSQL microservices experience with Kubernetes and Kafka."));

        assertThat(response.matchScore()).isBetween(1, 100);
        assertThat(response.matchedKeywords()).contains("java", "spring", "aws", "postgresql", "microservices");
        assertThat(response.missingKeywords()).contains("kubernetes", "kafka");
        assertThat(response.suggestions()).isNotEmpty();
    }

    @Test
    void validatesResumeOwnership() {
        UUID resumeId = UUID.randomUUID();
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(resumeRepository.findDistinctByIdAndUserId(resumeId, user.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.analyze("jane@example.com",
                new ResumeMatchAnalyzeRequest(resumeId, "Java Spring Boot role")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rejectsResumeWithoutUploadedVersions() {
        Resume resume = new Resume(user, "Empty Resume", Set.of("backend"));
        UUID resumeId = resume.getId();
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(resumeRepository.findDistinctByIdAndUserId(resumeId, user.getId())).thenReturn(Optional.of(resume));

        assertThatThrownBy(() -> service.analyze("jane@example.com",
                new ResumeMatchAnalyzeRequest(resumeId, "Java Spring Boot role")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no uploaded versions");
    }

    @Test
    void rejectsJobDescriptionsWithoutUsableKeywords() {
        Resume resume = resumeWithText("Backend Resume", "Java Spring Boot PostgreSQL APIs");
        UUID resumeId = resume.getId();
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(resumeRepository.findDistinctByIdAndUserId(resumeId, user.getId())).thenReturn(Optional.of(resume));

        assertThatThrownBy(() -> service.analyze("jane@example.com",
                new ResumeMatchAnalyzeRequest(resumeId, "and the to with for")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("enough keywords");
    }

    private Resume resumeWithText(String name, String text) {
        Resume resume = new Resume(user, name, Set.of("backend"));
        ResumeVersion version = new ResumeVersion(resume, 1, "resume.pdf", "application/pdf",
                text.length(), UUID.randomUUID() + ".pdf", "a".repeat(64), text);
        resume.addVersion(version);
        return resume;
    }
}
