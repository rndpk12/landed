package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.List;

/**
 * Juspay careers pages render their job facts in the public HTML, but do not
 * use structured JobPosting data. Keep the selectors scoped to its careers
 * template so generic marketing-page text is never imported as a job.
 */
@Component
public class JuspayProvider extends AbstractJsoupJobProvider {
    @Override
    public JobSource source() {
        return JobSource.JUSPAY;
    }

    @Override
    protected ExtractedJob extractFromDocument(URI uri, Document document) {
        ExtractedJob extracted = super.extractFromDocument(uri, document);
        return new ExtractedJob(
                "Juspay",
                extracted.role(),
                extracted.location(),
                extracted.employmentType(),
                extracted.experience(),
                extracted.salary(),
                extracted.skills(),
                extracted.description()
        );
    }

    @Override
    protected List<String> roleSelectors() {
        return List.of("#careers-hero h1", "main h1", "h1");
    }

    @Override
    protected List<String> locationSelectors() {
        return List.of("#careers-hero > div > div:last-child", "#careers-hero [class*=location]");
    }

    @Override
    protected List<String> employmentTypeSelectors() {
        return List.of("#careers-hero > div > div:first-child", "#careers-hero [class*=type]");
    }

    @Override
    protected List<String> descriptionSelectors() {
        return List.of("#careers-content .prose", "#careers-content", "main");
    }
}
