package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NaukriProvider extends AbstractJsoupJobProvider {
    @Override
    public JobSource source() {
        return JobSource.NAUKRI;
    }

    @Override
    protected List<String> roleSelectors() {
        return List.of(".jd-header-title", ".styles_jd-header-title__rZwM1", "h1");
    }

    @Override
    protected List<String> companySelectors() {
        return List.of(".jd-header-comp-name", ".styles_jd-header-comp-name__MvqAI", "[class*=company]");
    }

    @Override
    protected List<String> locationSelectors() {
        return List.of(".locWdth", ".styles_jhc__location__W_pVs", "[class*=location]");
    }

    @Override
    protected List<String> experienceSelectors() {
        return List.of(".exp", ".styles_jhc__exp__k_giM", "[class*=experience]");
    }

    @Override
    protected List<String> descriptionSelectors() {
        return List.of(".job-desc", ".styles_JDC__dang-inner-html__h0K4t", "main");
    }
}
