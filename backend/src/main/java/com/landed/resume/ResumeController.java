package com.landed.resume;

import com.landed.resume.dto.ResumeDiffResponse;
import com.landed.resume.dto.ResumeMetadataRequest;
import com.landed.resume.dto.ResumeResponse;
import com.landed.resume.dto.ResumeVersionResponse;
import com.landed.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
@SecurityRequirement(name = "bearerAuth")
public class ResumeController {
    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a resume and its first version")
    public ResumeResponse create(Authentication authentication,
                                 @Valid @RequestPart("metadata") ResumeMetadataRequest metadata,
                                 @RequestPart("file") MultipartFile file) {
        return resumeService.create(authentication.getName(), metadata, file);
    }

    @GetMapping
    @Operation(summary = "List the current user's resume vault")
    public PageResponse<ResumeResponse> getAll(Authentication authentication,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "25") int size) {
        return resumeService.getAll(authentication.getName(), page, size);
    }

    @GetMapping("/{id}")
    public ResumeResponse get(Authentication authentication, @PathVariable UUID id) {
        return resumeService.get(authentication.getName(), id);
    }

    @PutMapping("/{id}")
    public ResumeResponse updateMetadata(Authentication authentication, @PathVariable UUID id,
                                         @Valid @org.springframework.web.bind.annotation.RequestBody ResumeMetadataRequest metadata) {
        return resumeService.updateMetadata(authentication.getName(), id, metadata);
    }

    @PostMapping(value = "/{id}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeVersionResponse addVersion(Authentication authentication, @PathVariable UUID id,
                                             @RequestPart("file") MultipartFile file) {
        return resumeService.addVersion(authentication.getName(), id, file);
    }

    @GetMapping("/versions/{versionId}/download")
    public ResponseEntity<Resource> download(Authentication authentication, @PathVariable UUID versionId) {
        ResumeService.DownloadedResume file = resumeService.download(authentication.getName(), versionId);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.filename(), StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(file.resource());
    }

    @GetMapping("/diff")
    public ResumeDiffResponse diff(Authentication authentication,
                                   @RequestParam UUID fromVersionId, @RequestParam UUID toVersionId) {
        return resumeService.diff(authentication.getName(), fromVersionId, toVersionId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication authentication, @PathVariable UUID id) {
        resumeService.delete(authentication.getName(), id);
    }
}
