package com.landed.resumeperformance;

import com.landed.resumeperformance.dto.ResumePerformanceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resume-performance")
@SecurityRequirement(name = "bearerAuth")
public class ResumePerformanceController {
    private final ResumePerformanceService resumePerformanceService;

    public ResumePerformanceController(ResumePerformanceService resumePerformanceService) {
        this.resumePerformanceService = resumePerformanceService;
    }

    @GetMapping
    @Operation(summary = "Get resume performance analytics for the current user")
    public List<ResumePerformanceResponse> getPerformance(Authentication authentication) {
        return resumePerformanceService.getPerformance(authentication.getName());
    }
}
