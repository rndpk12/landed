package com.landed.interview;

import com.landed.activity.ActivityService;
import com.landed.activity.ActivityType;
import com.landed.application.JobApplication;
import com.landed.application.JobApplicationRepository;
import com.landed.common.exception.ResourceNotFoundException;
import com.landed.interview.dto.InterviewNoteRequest;
import com.landed.interview.dto.InterviewNoteResponse;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class InterviewNoteService {
    private final InterviewNoteRepository interviewNoteRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public InterviewNoteService(InterviewNoteRepository interviewNoteRepository,
                                JobApplicationRepository applicationRepository,
                                UserRepository userRepository,
                                ActivityService activityService) {
        this.interviewNoteRepository = interviewNoteRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<InterviewNoteResponse> list(String email, UUID applicationId) {
        User user = requireUser(email);
        requireOwnedApplication(applicationId, user.getId());
        return interviewNoteRepository.findByApplicationIdAndApplicationUserIdOrderByRoundNumberAscCreatedAtAsc(
                        applicationId, user.getId())
                .stream()
                .map(InterviewNoteResponse::from)
                .toList();
    }

    @Transactional
    public InterviewNoteResponse create(String email, UUID applicationId, InterviewNoteRequest request) {
        User user = requireUser(email);
        JobApplication application = requireOwnedApplication(applicationId, user.getId());
        InterviewNote note = interviewNoteRepository.save(new InterviewNote(application, request.roundNumber(),
                request.interviewDate(), blankToNull(request.questionsAsked()), blankToNull(request.notes()),
                blankToNull(request.outcome())));
        activityService.record(user, ActivityType.INTERVIEW_NOTE_CREATED, "Interview note created",
                activityDescription(application, note), application.getId());
        return InterviewNoteResponse.from(note);
    }

    @Transactional
    public InterviewNoteResponse update(String email, UUID id, InterviewNoteRequest request) {
        User user = requireUser(email);
        InterviewNote note = requireOwnedNote(id, user.getId());
        note.update(request.roundNumber(), request.interviewDate(), blankToNull(request.questionsAsked()),
                blankToNull(request.notes()), blankToNull(request.outcome()));
        activityService.record(user, ActivityType.INTERVIEW_NOTE_UPDATED, "Interview note updated",
                activityDescription(note.getApplication(), note), note.getApplication().getId());
        return InterviewNoteResponse.from(note);
    }

    @Transactional
    public void delete(String email, UUID id) {
        User user = requireUser(email);
        InterviewNote note = requireOwnedNote(id, user.getId());
        JobApplication application = note.getApplication();
        String description = activityDescription(application, note);
        interviewNoteRepository.delete(note);
        activityService.record(user, ActivityType.INTERVIEW_NOTE_DELETED, "Interview note deleted",
                description, application.getId());
    }

    private User requireUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private JobApplication requireOwnedApplication(UUID applicationId, UUID userId) {
        return applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    private InterviewNote requireOwnedNote(UUID id, UUID userId) {
        return interviewNoteRepository.findByIdAndApplicationUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview note not found"));
    }

    private String activityDescription(JobApplication application, InterviewNote note) {
        return application.getCompany() + " - Round " + note.getRoundNumber();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
