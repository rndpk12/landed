package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;
import org.springframework.stereotype.Component;

@Component
public class GenericProvider extends AbstractJsoupJobProvider {
    @Override
    public JobSource source() {
        return JobSource.GENERIC;
    }
}
