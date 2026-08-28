package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LinkedInProvider extends AbstractJsoupJobProvider {
    @Override
    public JobSource source() {
        return JobSource.LINKEDIN;
    }

    @Override
    protected List<String> roleSelectors() {
        return List.of(".top-card-layout__title", ".jobs-unified-top-card__job-title", "h1");
    }

    @Override
    protected List<String> companySelectors() {
        return List.of(".topcard__org-name-link", ".jobs-unified-top-card__company-name", ".top-card-layout__second-subline a");
    }

    @Override
    protected List<String> descriptionSelectors() {
        return List.of(".show-more-less-html__markup", ".jobs-description-content__text", ".description__text", "main");
    }
}
