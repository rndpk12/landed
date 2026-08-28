package com.landed.resume;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ResumeProcessingService {
    private static final Logger log = LoggerFactory.getLogger(ResumeProcessingService.class);

    private final ResumeVersionRepository versionRepository;
    private final ResumeTextExtractor textExtractor;

    public ResumeProcessingService(ResumeVersionRepository versionRepository, ResumeTextExtractor textExtractor) {
        this.versionRepository = versionRepository;
        this.textExtractor = textExtractor;
    }

    @Async("resumeProcessingExecutor")
    @Transactional
    public void process(UUID versionId, byte[] bytes, String extension) {
        versionRepository.findById(versionId).ifPresent(version -> {
            try {
                version.markReady(textExtractor.extract(bytes, extension));
            } catch (RuntimeException exception) {
                log.warn("Resume text extraction failed for version {}", versionId, exception);
                version.markFailed(exception.getMessage());
            }
        });
    }

    @Transactional
    public void markSubmissionFailed(UUID versionId) {
        versionRepository.findById(versionId)
                .ifPresent(version -> version.markFailed("Resume processing queue is full. Upload the file again."));
    }
}
