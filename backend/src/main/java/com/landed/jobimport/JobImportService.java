package com.landed.jobimport;

import com.landed.common.exception.BadRequestException;
import com.landed.jobimport.dto.JobImportResponse;
import com.landed.jobimport.provider.ExtractedJob;
import com.landed.jobimport.provider.JobProvider;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class JobImportService {
    private final JobSourceDetector detector;
    private final Map<JobSource, JobProvider> providers;

    public JobImportService(JobSourceDetector detector, List<JobProvider> providers) {
        this.detector = detector;
        this.providers = new EnumMap<>(JobSource.class);
        providers.forEach(provider -> this.providers.put(provider.source(), provider));
    }

    public JobImportResponse importJob(String url) {
        URI uri = parseUri(url);
        JobSource source = detector.detect(uri);
        JobProvider provider = providers.getOrDefault(source, providers.get(JobSource.GENERIC));
        try {
            ExtractedJob extracted = provider.extract(uri);
            return normalize(extracted);
        } catch (IllegalStateException exception) {
            throw new BadRequestException(exception.getMessage(), exception);
        }
    }

    private URI parseUri(String url) {
        try {
            URI uri = URI.create(url);
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null) {
                throw new BadRequestException("Enter a valid HTTPS job URL.");
            }
            return uri;
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Enter a valid HTTPS job URL.");
        }
    }

    private JobImportResponse normalize(ExtractedJob extracted) {
        return new JobImportResponse(
                clean(extracted.company()),
                clean(extracted.role()),
                clean(extracted.location()),
                clean(extracted.employmentType()),
                clean(extracted.experience()),
                clean(extracted.salary()),
                extracted.skills() == null ? List.of() : extracted.skills().stream().map(this::clean).filter(value -> !value.isBlank()).distinct().toList(),
                clean(extracted.description())
        );
    }

    private String clean(String value) {
        return value == null ? "" : value.replaceAll("\\s+", " ").trim();
    }
}
