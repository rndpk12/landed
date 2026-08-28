package com.landed.jobimport;

import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Locale;

@Component
public class JobSourceDetector {
    public JobSource detect(URI uri) {
        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);

        if (host.contains("linkedin.")) {
            return JobSource.LINKEDIN;
        }
        if (host.contains("greenhouse.io")) {
            return JobSource.GREENHOUSE;
        }
        if (host.contains("lever.co")) {
            return JobSource.LEVER;
        }
        if (host.contains("myworkdayjobs.com") || host.contains("workdayjobs.com")) {
            return JobSource.WORKDAY;
        }
        if (host.contains("ashbyhq.com")) {
            return JobSource.ASHBY;
        }
        if (host.contains("naukri.com")) {
            return JobSource.NAUKRI;
        }

        return JobSource.GENERIC;
    }
}
