package com.landed.resumematch;

import com.landed.resumematch.dto.ResumeMatchAnalyzeRequest;
import com.landed.resumematch.dto.ResumeMatchAnalyzeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/resume-match")
@SecurityRequirement(name = "bearerAuth")
public class ResumeMatchController {
    private final ResumeMatchService resumeMatchService;

    public ResumeMatchController(ResumeMatchService resumeMatchService) {
        this.resumeMatchService = resumeMatchService;
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyze how well a stored resume matches a job description")
    public ResumeMatchAnalyzeResponse analyze(Authentication authentication,
                                              @Valid @RequestBody ResumeMatchAnalyzeRequest request) {
        return resumeMatchService.analyze(authentication.getName(), request);
    }
}
