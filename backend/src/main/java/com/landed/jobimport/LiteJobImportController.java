package com.landed.jobimport;

import com.landed.jobimport.dto.JobImportRequest;
import com.landed.jobimport.dto.JobImportResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public, rate-limited endpoint used only by the account-free Landed Lite importer. */
@RestController
@RequestMapping("/api/v1/lite/job-import")
public class LiteJobImportController {
    private final JobImportService jobImportService;

    public LiteJobImportController(JobImportService jobImportService) {
        this.jobImportService = jobImportService;
    }

    @PostMapping
    @Operation(summary = "Import supported job details for Landed Lite without an account")
    public JobImportResponse importJob(@Valid @RequestBody JobImportRequest request) {
        return jobImportService.importLiteJob(request.url());
    }
}
