package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WorkdayProvider extends AbstractJsoupJobProvider {
    @Override
    public JobSource source() {
        return JobSource.WORKDAY;
    }

    @Override
    protected List<String> roleSelectors() {
        return List.of("[data-automation-id='jobPostingHeader']", "[data-automation-id='jobPostingTitle']", "h1");
    }

    @Override
    protected List<String> locationSelectors() {
        return List.of("[data-automation-id='locations']", "[data-automation-id='location']", "[class*=location]");
    }

    @Override
    protected List<String> descriptionSelectors() {
        return List.of("[data-automation-id='jobPostingDescription']", "[data-automation-id='jobDescription']", "main");
    }
}
