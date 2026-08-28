package com.landed.application;

import com.landed.activity.ActivityService;
import com.landed.application.dto.ApplicationRequest;
import com.landed.common.exception.ResourceNotFoundException;
import com.landed.resume.ResumeVersionRepository;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {
    @Mock JobApplicationRepository applicationRepository;
    @Mock ApplicationStageNoteRepository stageNoteRepository;
    @Mock UserRepository userRepository;
    @Mock ResumeVersionRepository resumeVersionRepository;
    @Mock ActivityService activityService;

    private JobApplicationService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new JobApplicationService(applicationRepository, stageNoteRepository, userRepository,
                resumeVersionRepository, activityService);
        user = new User("Jane", "jane@example.com", "encoded");
    }

    @Test
    void cannotDeleteApplicationOwnedByAnotherUser() {
        UUID applicationId = UUID.randomUUID();
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(applicationRepository.findByIdAndUserId(applicationId, user.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete("jane@example.com", applicationId))
            .isInstanceOf(ResourceNotFoundException.class);
        verify(applicationRepository, never()).delete(org.mockito.ArgumentMatchers.any(com.landed.application.JobApplication.class));
    }

    @Test
    void validatesOwnershipDuringUpdateLookup() {
        UUID applicationId = UUID.randomUUID();
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(applicationRepository.findByIdAndUserId(applicationId, user.getId())).thenReturn(Optional.empty());
        var request = new ApplicationRequest(
            "Acme",
            "Engineer",
            null,
            null,
            null,
            null,
            null,
            ApplicationStatus.APPLIED,
            null,
            LocalDate.now()
        );

        assertThatThrownBy(() -> service.update("jane@example.com", applicationId, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void validatesResumeVersionOwnershipDuringCreate() {
        UUID resumeVersionId = UUID.randomUUID();
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(resumeVersionRepository.findByIdAndResumeUserId(resumeVersionId, user.getId())).thenReturn(Optional.empty());
        var request = new ApplicationRequest(
            "Acme",
            "Engineer",
            null,
            null,
            null,
            null,
            resumeVersionId,
            ApplicationStatus.APPLIED,
            null,
            LocalDate.now()
        );

        assertThatThrownBy(() -> service.create("jane@example.com", request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(applicationRepository, never()).save(org.mockito.ArgumentMatchers.any(JobApplication.class));
    }
}
