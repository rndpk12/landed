package com.landed.resumeperformance;

import com.landed.application.ApplicationStatus;
import com.landed.application.JobApplication;
import com.landed.application.JobApplicationRepository;
import com.landed.resume.Resume;
import com.landed.resume.ResumeRepository;
import com.landed.resume.ResumeVersion;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResumePerformanceServiceTest {
    @Mock ResumeRepository resumeRepository;
    @Mock JobApplicationRepository applicationRepository;
    @Mock UserRepository userRepository;

    private ResumePerformanceService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new ResumePerformanceService(resumeRepository, applicationRepository, userRepository);
        user = new User("Jane", "jane@example.com", "encoded");
    }

    @Test
    void aggregatesApplicationsByResumeAndSortsByConversion() {
        Resume backendResume = resume("Backend Resume", 5);
        Resume frontendResume = resume("Frontend Resume", 2);
        ResumeVersion backendVersion = backendResume.getVersions().getFirst();
        ResumeVersion frontendVersion = frontendResume.getVersions().getFirst();

        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(resumeRepository.findDistinctByUserIdOrderByUpdatedAtDesc(user.getId()))
                .thenReturn(List.of(backendResume, frontendResume));
        when(applicationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()))
                .thenReturn(List.of(
                        application(backendVersion, ApplicationStatus.APPLIED),
                        application(backendVersion, ApplicationStatus.INTERVIEW),
                        application(backendVersion, ApplicationStatus.OFFER),
                        application(frontendVersion, ApplicationStatus.APPLIED),
                        application(frontendVersion, ApplicationStatus.REJECTED)
                ));

        var performance = service.getPerformance("jane@example.com");

        assertThat(performance).hasSize(2);
        assertThat(performance.getFirst().resumeId()).isEqualTo(backendResume.getId());
        assertThat(performance.getFirst().resumeName()).isEqualTo("Backend Resume v5");
        assertThat(performance.getFirst().applications()).isEqualTo(3);
        assertThat(performance.getFirst().interviews()).isEqualTo(2);
        assertThat(performance.getFirst().offers()).isEqualTo(1);
        assertThat(performance.getFirst().conversionRate()).isEqualTo(67);

        assertThat(performance.get(1).resumeId()).isEqualTo(frontendResume.getId());
        assertThat(performance.get(1).applications()).isEqualTo(2);
        assertThat(performance.get(1).interviews()).isZero();
        assertThat(performance.get(1).offers()).isZero();
        assertThat(performance.get(1).conversionRate()).isZero();
    }

    @Test
    void includesResumesWithNoApplications() {
        Resume resume = resume("General Resume", 1);
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(resumeRepository.findDistinctByUserIdOrderByUpdatedAtDesc(user.getId())).thenReturn(List.of(resume));
        when(applicationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())).thenReturn(List.of());

        var performance = service.getPerformance("jane@example.com");

        assertThat(performance).singleElement().satisfies(item -> {
            assertThat(item.resumeName()).isEqualTo("General Resume v1");
            assertThat(item.applications()).isZero();
            assertThat(item.conversionRate()).isZero();
        });
    }

    private Resume resume(String name, int versionNumber) {
        Resume resume = new Resume(user, name, Set.of("backend"));
        resume.addVersion(new ResumeVersion(resume, versionNumber, name + ".pdf", "application/pdf",
                1000, UUID.randomUUID() + ".pdf", "a".repeat(64), "Java Spring Boot"));
        return resume;
    }

    private JobApplication application(ResumeVersion resumeVersion, ApplicationStatus status) {
        return new JobApplication(user, "Acme", "Engineer", null, null, null, null,
                resumeVersion, status, null, LocalDate.now());
    }
}
