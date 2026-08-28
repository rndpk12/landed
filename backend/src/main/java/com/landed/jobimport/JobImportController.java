package com.landed.jobimport;

import com.landed.jobimport.dto.JobImportRequest;
import com.landed.jobimport.dto.JobImportResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/job-import")
@SecurityRequirement(name = "bearerAuth")
public class JobImportController {
    private final JobImportService jobImportService;

    public JobImportController(JobImportService jobImportService) {
        this.jobImportService = jobImportService;
    }

    @PostMapping
    @Operation(summary = "Import job details from a job URL")
    public JobImportResponse importJob(@Valid @RequestBody JobImportRequest request) {
        return jobImportService.importJob(request.url());
    }
}
