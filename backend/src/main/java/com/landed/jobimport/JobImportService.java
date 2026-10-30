package com.landed.jobimport;

import com.landed.common.exception.BadRequestException;
import com.landed.jobimport.dto.JobImportResponse;
import com.landed.jobimport.provider.ExtractedJob;
import com.landed.jobimport.provider.JobProvider;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.net.URI;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobImportService {
    private final JobSourceDetector detector;
    private final Map<JobSource, JobProvider> providers;
    private final Set<String> allowedHosts;

    public JobImportService(JobSourceDetector detector, List<JobProvider> providers,
                            @Value("${app.job-import.allowed-hosts}") String allowedHosts) {
        this.detector = detector;
        this.providers = new EnumMap<>(JobSource.class);
        providers.forEach(provider -> this.providers.put(provider.source(), provider));
        this.allowedHosts = java.util.Arrays.stream(allowedHosts.toLowerCase().split(","))
                .map(String::trim)
                .filter(host -> !host.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    public JobImportResponse importJob(String url) {
        URI uri = parseUri(url);
        requireAllowedHost(uri);
        return importUri(uri);
    }

    /**
     * Anonymous Lite imports must never be a general-purpose URL fetcher. Only
     * job-board domains the product explicitly supports are eligible here.
     */
    public JobImportResponse importLiteJob(String url) {
        URI uri = parseUri(url);
        if (!isAllowedHost(uri.getHost())) {
            throw new BadRequestException("Landed Lite can automatically import LinkedIn, Greenhouse, Lever, Workday, Ashby, Naukri, Heizen, and Juspay URLs. Use the browser extension or enter other job sites manually.");
        }
        return importUri(uri);
    }

    private JobImportResponse importUri(URI uri) {
        JobSource source = detector.detect(uri);
        JobProvider provider = providers.getOrDefault(source, providers.get(JobSource.GENERIC));
        try {
            ExtractedJob extracted = provider.extract(uri);
            return normalize(extracted);
        } catch (IllegalStateException exception) {
            throw new BadRequestException(exception.getMessage(), exception);
        }
    }

    private void requireAllowedHost(URI uri) {
        if (!isAllowedHost(uri.getHost())) {
            throw new BadRequestException("This job board is not supported for direct import.");
        }
    }

    private boolean isAllowedHost(String host) {
        if (host == null) return false;
        String normalized = host.toLowerCase();
        return allowedHosts.stream().anyMatch(domain -> normalized.equals(domain) || normalized.endsWith("." + domain));
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
