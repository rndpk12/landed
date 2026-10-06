package com.landed.feedback;

import com.landed.feedback.dto.LiteFeedbackRequest;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Receives optional, anonymous product feedback from the account-free Lite app. */
@RestController
@RequestMapping("/api/v1/lite/feedback")
public class LiteFeedbackController {
    private final LiteFeedbackRepository feedbackRepository;

    public LiteFeedbackController(LiteFeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Send anonymous Landed Lite feedback")
    public void submit(@Valid @RequestBody LiteFeedbackRequest request) {
        feedbackRepository.save(new LiteFeedback(request.category(), request.message().trim(), request.email()));
    }
}
