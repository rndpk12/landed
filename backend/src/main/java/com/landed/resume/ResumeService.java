package com.landed.resume;

import com.landed.activity.ActivityService;
import com.landed.activity.ActivityType;
import com.landed.application.JobApplicationRepository;
import com.landed.common.exception.ResourceNotFoundException;
import com.landed.common.dto.PageResponse;
import com.landed.resume.ResumeStorageService.StoredFile;
import com.landed.resume.dto.ResumeDiffResponse;
import com.landed.resume.dto.ResumeMetadataRequest;
import com.landed.resume.dto.ResumeResponse;
import com.landed.resume.dto.ResumeVersionResponse;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ResumeService {
    private final ResumeRepository resumeRepository;
    private final ResumeVersionRepository versionRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ResumeStorageService storageService;
    private final ResumeTextExtractor textExtractor;
    private final ResumeProcessingService processingService;
    private final ResumeDiffService diffService;
    private final ActivityService activityService;

    public ResumeService(ResumeRepository resumeRepository, ResumeVersionRepository versionRepository,
                         JobApplicationRepository applicationRepository, UserRepository userRepository,
                         ResumeStorageService storageService, ResumeTextExtractor textExtractor,
                         ResumeProcessingService processingService, ResumeDiffService diffService,
                         ActivityService activityService) {
        this.resumeRepository = resumeRepository;
        this.versionRepository = versionRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.textExtractor = textExtractor;
        this.processingService = processingService;
        this.diffService = diffService;
        this.activityService = activityService;
    }

    @Transactional
    public ResumeResponse create(String email, ResumeMetadataRequest metadata, MultipartFile file) {
        User user = requireUser(email);
        Resume resume = resumeRepository.save(new Resume(user, metadata.name().trim(), normalizeTags(metadata.tags())));
        ResumeVersion version = storeVersion(resume, 1, file);
        resume.addVersion(version);
        activityService.record(user, ActivityType.RESUME_UPLOADED, "Resume uploaded",
                resume.getName() + " v" + version.getVersionNumber(), resume.getId());
        return response(resume);
    }

    @Transactional(readOnly = true)
    public PageResponse<ResumeResponse> getAll(String email, int page, int size) {
        User user = requireUser(email);
        int boundedPage = Math.max(0, page);
        int boundedSize = Math.max(1, Math.min(size, 100));
        var pageable = PageRequest.of(boundedPage, boundedSize, Sort.by(Sort.Direction.DESC, "updatedAt"));
        var resumePage = resumeRepository.findByUserId(user.getId(), pageable);
        List<UUID> ids = resumePage.getContent().stream().map(Resume::getId).toList();
        if (ids.isEmpty()) {
            return PageResponse.from(resumePage.map(resume -> ResumeResponse.from(resume, 0)));
        }

        Map<UUID, Resume> detailedResumes = resumeRepository.findAllWithDetailsByIdIn(ids).stream()
                .collect(Collectors.toMap(Resume::getId, Function.identity()));
        Map<UUID, Integer> applicationCounts = applicationRepository.countByResumeIds(ids).stream()
                .collect(Collectors.toMap(
                        JobApplicationRepository.ResumeApplicationCount::getResumeId,
                        count -> Math.toIntExact(count.getApplicationCount())));

        return PageResponse.from(resumePage.map(resume -> {
            Resume detailed = detailedResumes.getOrDefault(resume.getId(), resume);
            return ResumeResponse.from(detailed, applicationCounts.getOrDefault(resume.getId(), 0));
        }));
    }

    @Transactional(readOnly = true)
    public ResumeResponse get(String email, UUID id) {
        return response(requireResume(email, id));
    }

    @Transactional
    public ResumeResponse updateMetadata(String email, UUID id, ResumeMetadataRequest metadata) {
        Resume resume = requireResume(email, id);
        resume.updateMetadata(metadata.name().trim(), normalizeTags(metadata.tags()));
        return response(resume);
    }

    @Transactional
    public ResumeVersionResponse addVersion(String email, UUID id, MultipartFile file) {
        User user = requireUser(email);
        Resume resume = resumeRepository.findOwnedForUpdate(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        int nextVersion = versionRepository.findTopByResumeIdOrderByVersionNumberDesc(id)
                .map(version -> version.getVersionNumber() + 1)
                .orElse(1);
        ResumeVersion version = storeVersion(resume, nextVersion, file);
        resume.touch();
        activityService.record(user, ActivityType.RESUME_VERSION_CREATED, "Resume version created",
                resume.getName() + " v" + version.getVersionNumber(), resume.getId());
        return ResumeVersionResponse.from(version);
    }

    @Transactional(readOnly = true)
    public DownloadedResume download(String email, UUID versionId) {
        User user = requireUser(email);
        ResumeVersion version = requireVersion(versionId, user.getId());
        return new DownloadedResume(storageService.load(version.getStorageKey()), version.getOriginalFilename(),
                version.getContentType());
    }

    @Transactional(readOnly = true)
    public ResumeDiffResponse diff(String email, UUID fromVersionId, UUID toVersionId) {
        User user = requireUser(email);
        ResumeVersion from = requireVersion(fromVersionId, user.getId());
        ResumeVersion to = requireVersion(toVersionId, user.getId());
        return diffService.compare(from, to);
    }

    @Transactional
    public void delete(String email, UUID id) {
        Resume resume = requireResume(email, id);
        List<String> keys = resume.getVersions().stream().map(ResumeVersion::getStorageKey).toList();
        resumeRepository.delete(resume);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                keys.forEach(storageService::delete);
            }
        });
    }

    private ResumeVersion storeVersion(Resume resume, int versionNumber, MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String originalFilename = file.getOriginalFilename();
            String extension = extension(originalFilename);
            StoredFile stored = storageService.store(bytes, originalFilename);
            registerRollbackCleanup(stored.key());
            ResumeVersion version = new ResumeVersion(resume, versionNumber, stored.originalFilename(),
                    contentType(stored.extension()), bytes.length, stored.key(), sha256(bytes), "");
            ResumeVersion saved = versionRepository.save(version);
            registerProcessingAfterCommit(saved.getId(), bytes, extension);
            return saved;
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Could not read uploaded resume", exception);
        }
    }

    private void registerProcessingAfterCommit(UUID versionId, byte[] bytes, String extension) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    processingService.process(versionId, bytes, extension);
                } catch (RuntimeException exception) {
                    processingService.markSubmissionFailed(versionId);
                }
            }
        });
    }

    private void registerRollbackCleanup(String key) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) storageService.delete(key);
            }
        });
    }

    private ResumeResponse response(Resume resume) {
        return ResumeResponse.from(resume, applicationRepository.countByResumeVersionResumeId(resume.getId()));
    }

    private User requireUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Resume requireResume(String email, UUID id) {
        User user = requireUser(email);
        return resumeRepository.findDistinctByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
    }

    private ResumeVersion requireVersion(UUID id, UUID userId) {
        return versionRepository.findByIdAndResumeUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume version not found"));
    }

    private Set<String> normalizeTags(Set<String> tags) {
        if (tags == null) return Set.of();
        Set<String> normalized = new LinkedHashSet<>();
        tags.stream().map(String::trim).filter(value -> !value.isBlank())
                .map(value -> value.toLowerCase(Locale.ROOT)).forEach(normalized::add);
        return normalized;
    }

    private String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (Exception exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private String extension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String contentType(String extension) {
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "txt" -> "text/plain";
            default -> "application/octet-stream";
        };
    }

    public record DownloadedResume(Resource resource, String filename, String contentType) { }
}
