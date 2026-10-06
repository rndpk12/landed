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
import java.util.Set;

@Service
public class JobImportService {
    private static final Set<String> LITE_IMPORT_HOSTS = Set.of(
            "linkedin.com", "greenhouse.io", "lever.co", "myworkdayjobs.com", "workdayjobs.com", "ashbyhq.com", "naukri.com", "heizen.work"
    );
    private final JobSourceDetector detector;
    private final Map<JobSource, JobProvider> providers;

    public JobImportService(JobSourceDetector detector, List<JobProvider> providers) {
        this.detector = detector;
        this.providers = new EnumMap<>(JobSource.class);
        providers.forEach(provider -> this.providers.put(provider.source(), provider));
    }

    public JobImportResponse importJob(String url) {
        URI uri = parseUri(url);
        return importUri(uri);
    }

    /**
     * Anonymous Lite imports must never be a general-purpose URL fetcher. Only
     * job-board domains the product explicitly supports are eligible here.
     */
    public JobImportResponse importLiteJob(String url) {
        URI uri = parseUri(url);
        if (!isLiteImportHost(uri.getHost())) {
            throw new BadRequestException("Landed Lite can automatically import LinkedIn, Greenhouse, Lever, Workday, Ashby, Naukri, and Heizen URLs. Use the browser extension or enter other job sites manually.");
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

    private boolean isLiteImportHost(String host) {
        if (host == null) return false;
        String normalized = host.toLowerCase();
        return LITE_IMPORT_HOSTS.stream().anyMatch(domain -> normalized.equals(domain) || normalized.endsWith("." + domain));
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
