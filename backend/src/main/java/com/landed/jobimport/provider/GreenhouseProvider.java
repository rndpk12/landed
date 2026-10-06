package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GreenhouseProvider extends AbstractJsoupJobProvider {
    @Override
    public JobSource source() {
        return JobSource.GREENHOUSE;
    }

    @Override
    protected List<String> roleSelectors() {
        return List.of(".app-title", "#header h1", "h1");
    }

    @Override
    protected List<String> companySelectors() {
        return List.of(".company-name", "[data-qa='company-name']", "[class*=company]");
    }

    @Override
    protected List<String> companyAttributeSelectors() {
        // Current Greenhouse boards place the employer logo here. Avoid a broad
        // header-image selector: it can pick up the generic job-board brand.
        return List.of(".image-container img.logo", "#logo img", ".company-logo img");
    }

    @Override
    protected List<String> locationSelectors() {
        return List.of(".job__location > div", ".job__location", "#header .location", ".app-location", ".location", "[data-qa='location']", "[class*=location]", ".app-title + div");
    }

    @Override
    protected List<String> descriptionSelectors() {
        return List.of("#content", ".content", ".job__description", "main");
    }
}
