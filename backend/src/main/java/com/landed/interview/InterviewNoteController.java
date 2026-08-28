package com.landed.interview;

import com.landed.interview.dto.InterviewNoteRequest;
import com.landed.interview.dto.InterviewNoteResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "bearerAuth")
public class InterviewNoteController {
    private final InterviewNoteService interviewNoteService;

    public InterviewNoteController(InterviewNoteService interviewNoteService) {
        this.interviewNoteService = interviewNoteService;
    }

    @GetMapping("/applications/{applicationId}/interview-notes")
    @Operation(summary = "Get interview notes for an owned application")
    public List<InterviewNoteResponse> list(Authentication authentication, @PathVariable UUID applicationId) {
        return interviewNoteService.list(authentication.getName(), applicationId);
    }

    @PostMapping("/applications/{applicationId}/interview-notes")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an interview note for an owned application")
    public InterviewNoteResponse create(Authentication authentication, @PathVariable UUID applicationId,
                                        @Valid @RequestBody InterviewNoteRequest request) {
        return interviewNoteService.create(authentication.getName(), applicationId, request);
    }

    @PutMapping("/interview-notes/{id}")
    @Operation(summary = "Update an owned interview note")
    public InterviewNoteResponse update(Authentication authentication, @PathVariable UUID id,
                                        @Valid @RequestBody InterviewNoteRequest request) {
        return interviewNoteService.update(authentication.getName(), id, request);
    }

    @DeleteMapping("/interview-notes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an owned interview note")
    public void delete(Authentication authentication, @PathVariable UUID id) {
        interviewNoteService.delete(authentication.getName(), id);
    }
}
