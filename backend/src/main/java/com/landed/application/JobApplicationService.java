package com.landed.application;

import com.landed.activity.ActivityService;
import com.landed.activity.ActivityType;
import com.landed.application.dto.ApplicationRequest;
import com.landed.application.dto.ApplicationResponse;
import com.landed.application.dto.StageNoteRequest;
import com.landed.application.dto.StageNoteResponse;
import com.landed.common.dto.PageResponse;
import com.landed.common.exception.ResourceNotFoundException;
import com.landed.resume.ResumeVersion;
import com.landed.resume.ResumeVersionRepository;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;
import java.util.UUID;

@Service
public class JobApplicationService {
    private final JobApplicationRepository applicationRepository;
    private final ApplicationStageNoteRepository stageNoteRepository;
    private final UserRepository userRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final ActivityService activityService;

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 ApplicationStageNoteRepository stageNoteRepository,
                                 UserRepository userRepository,
                                 ResumeVersionRepository resumeVersionRepository,
                                 ActivityService activityService) {
        this.applicationRepository = applicationRepository;
        this.stageNoteRepository = stageNoteRepository;
        this.userRepository = userRepository;
        this.resumeVersionRepository = resumeVersionRepository;
        this.activityService = activityService;
    }

    @Transactional
    public ApplicationResponse create(String email, ApplicationRequest request) {
        User user = requireUser(email);
        ResumeVersion resumeVersion = resolveResumeVersion(request.resumeVersionId(), user.getId());
        JobApplication application = new JobApplication(user, clean(request.company()), clean(request.role()),
                blankToNull(request.jobUrl()), blankToNull(request.location()), blankToNull(request.jobDescription()),
                blankToNull(request.employmentType()), resumeVersion, request.status(), blankToNull(request.notes()),
                request.appliedDate());
        JobApplication saved = applicationRepository.save(application);
        activityService.record(user, ActivityType.APPLICATION_CREATED, "Application created",
                saved.getCompany() + " - " + saved.getRole(), saved.getId());
        return ApplicationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getAll(String email, int page, int size, String search,
                                                    ApplicationStatus status) {
        User user = requireUser(email);
        int boundedPage = Math.max(0, page);
        int boundedSize = Math.max(1, Math.min(size, 100));
        Specification<JobApplication> specification = (root, query, builder) ->
                builder.equal(root.get("user").get("id"), user.getId());
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, builder) -> builder.or(
                    builder.like(builder.lower(root.get("company")), pattern),
                    builder.like(builder.lower(root.get("role")), pattern),
                    builder.like(builder.lower(root.get("location")), pattern)));
        }
        if (status != null) {
            specification = specification.and((root, query, builder) -> builder.equal(root.get("status"), status));
        }
        var pageable = PageRequest.of(boundedPage, boundedSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(applicationRepository.findAll(specification, pageable).map(ApplicationResponse::from));
    }

    @Transactional
    public ApplicationResponse update(String email, UUID id, ApplicationRequest request) {
        User user = requireUser(email);
        JobApplication application = requireOwnedApplication(id, user.getId());
        ApplicationStatus previousStatus = application.getStatus();
        ResumeVersion resumeVersion = resolveResumeVersion(request.resumeVersionId(), user.getId());
        application.update(clean(request.company()), clean(request.role()), blankToNull(request.jobUrl()),
                blankToNull(request.location()), blankToNull(request.jobDescription()), blankToNull(request.employmentType()),
                resumeVersion, request.status(), blankToNull(request.notes()), request.appliedDate());
        if (previousStatus != request.status()) {
            activityService.record(user, ActivityType.APPLICATION_STATUS_CHANGED, "Application status changed",
                    application.getCompany() + " moved from " + displayStatus(previousStatus) + " to "
                            + displayStatus(request.status()), application.getId());
        }
        return ApplicationResponse.from(application);
    }

    @Transactional
    public StageNoteResponse addStageNote(String email, UUID applicationId, StageNoteRequest request) {
        User user = requireUser(email);
        JobApplication application = requireOwnedApplication(applicationId, user.getId());
        ApplicationStageNote note = stageNoteRepository.save(new ApplicationStageNote(application, request.status(),
                request.content().trim()));
        activityService.record(user, ActivityType.INTERVIEW_NOTE_ADDED, "Interview note added",
                application.getCompany() + " - " + displayStatus(note.getStatus()), application.getId());
        return StageNoteResponse.from(note);
    }

    @Transactional
    public void delete(String email, UUID id) {
        User user = requireUser(email);
        applicationRepository.delete(requireOwnedApplication(id, user.getId()));
    }

    private User requireUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private JobApplication requireOwnedApplication(UUID id, UUID userId) {
        return applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    private ResumeVersion resolveResumeVersion(UUID resumeVersionId, UUID userId) {
        if (resumeVersionId == null) {
            return null;
        }
        return resumeVersionRepository.findByIdAndResumeUserId(resumeVersionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume version not found"));
    }

    private String clean(String value) {
        return value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String displayStatus(ApplicationStatus status) {
        return switch (status) {
            case SAVED -> "Saved";
            case APPLIED -> "Applied";
            case OA -> "OA";
            case INTERVIEW -> "Interview";
            case OFFER -> "Offer";
            case REJECTED -> "Rejected";
            case ACCEPTED -> "Accepted";
        };
    }
}
