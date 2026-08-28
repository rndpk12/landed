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
        return List.of("#logo", ".company-name", ".app-title + div");
    }

    @Override
    protected List<String> locationSelectors() {
        return List.of(".location", ".app-location", "#header .location");
    }

    @Override
    protected List<String> descriptionSelectors() {
        return List.of("#content", ".content", ".job__description", "main");
    }
}
