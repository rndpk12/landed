package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AshbyProvider extends AbstractJsoupJobProvider {
    @Override
    public JobSource source() {
        return JobSource.ASHBY;
    }

    @Override
    protected List<String> roleSelectors() {
        return List.of("[data-testid='job-title']", ".ashby-job-posting-heading", "h1");
    }

    @Override
    protected List<String> locationSelectors() {
        return List.of("[data-testid='job-location']", ".ashby-job-posting-brief", "[class*=location]");
    }

    @Override
    protected List<String> descriptionSelectors() {
        return List.of("[data-testid='job-description']", ".ashby-job-posting-content", "main");
    }
}
