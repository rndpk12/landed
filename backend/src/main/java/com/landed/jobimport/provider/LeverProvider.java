package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LeverProvider extends AbstractJsoupJobProvider {
    @Override
    public JobSource source() {
        return JobSource.LEVER;
    }

    @Override
    protected List<String> roleSelectors() {
        return List.of(".posting-headline h2", ".posting-title h2", "h1");
    }

    @Override
    protected List<String> locationSelectors() {
        return List.of(".posting-categories .location", ".sort-by-location", "[class*=location]");
    }

    @Override
    protected List<String> employmentTypeSelectors() {
        return List.of(".posting-categories .commitment", "[class*=commitment]");
    }

    @Override
    protected List<String> descriptionSelectors() {
        return List.of(".posting-page", ".section-wrapper", ".content", "main");
    }
}
