package com.landed.resumeperformance;

import com.landed.application.ApplicationStatus;
import com.landed.application.JobApplication;
import com.landed.application.JobApplicationRepository;
import com.landed.common.exception.ResourceNotFoundException;
import com.landed.resume.Resume;
import com.landed.resume.ResumeRepository;
import com.landed.resume.ResumeVersion;
import com.landed.resumeperformance.dto.ResumePerformanceResponse;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ResumePerformanceService {
    private final ResumeRepository resumeRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public ResumePerformanceService(ResumeRepository resumeRepository, JobApplicationRepository applicationRepository,
                                    UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ResumePerformanceResponse> getPerformance(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Resume> resumes = resumeRepository.findDistinctByUserIdOrderByUpdatedAtDesc(user.getId());
        Map<UUID, MutablePerformance> performanceByResumeId = new LinkedHashMap<>();

        for (Resume resume : resumes) {
            performanceByResumeId.put(resume.getId(), new MutablePerformance(displayName(resume)));
        }

        for (JobApplication application : applicationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())) {
            if (application.getResumeVersion() == null) {
                continue;
            }
            UUID resumeId = application.getResumeVersion().getResume().getId();
            MutablePerformance performance = performanceByResumeId.get(resumeId);
            if (performance == null) {
                continue;
            }
            performance.applications++;
            if (isInterviewOrBeyond(application.getStatus())) {
                performance.interviews++;
            }
            if (isOffer(application.getStatus())) {
                performance.offers++;
            }
        }

        return performanceByResumeId.entrySet().stream()
                .map(entry -> toResponse(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparingInt(ResumePerformanceResponse::conversionRate).reversed()
                        .thenComparing(Comparator.comparingInt(ResumePerformanceResponse::applications).reversed())
                        .thenComparing(ResumePerformanceResponse::resumeName))
                .toList();
    }

    private ResumePerformanceResponse toResponse(UUID resumeId, MutablePerformance performance) {
        int conversionRate = performance.applications == 0
                ? 0
                : Math.round((performance.interviews / (float) performance.applications) * 100);
        return new ResumePerformanceResponse(resumeId, performance.resumeName, performance.applications,
                performance.interviews, performance.offers, conversionRate);
    }

    private boolean isInterviewOrBeyond(ApplicationStatus status) {
        return status == ApplicationStatus.INTERVIEW || status == ApplicationStatus.OFFER || status == ApplicationStatus.ACCEPTED;
    }

    private boolean isOffer(ApplicationStatus status) {
        return status == ApplicationStatus.OFFER || status == ApplicationStatus.ACCEPTED;
    }

    private String displayName(Resume resume) {
        return resume.getVersions().stream()
                .max(Comparator.comparingInt(ResumeVersion::getVersionNumber))
                .map(version -> resume.getName() + " v" + version.getVersionNumber())
                .orElse(resume.getName());
    }

    private static class MutablePerformance {
        private final String resumeName;
        private int applications;
        private int interviews;
        private int offers;

        private MutablePerformance(String resumeName) {
            this.resumeName = resumeName;
        }
    }
}
