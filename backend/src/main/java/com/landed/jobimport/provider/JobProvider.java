package com.landed.jobimport.provider;

import com.landed.jobimport.JobSource;

import java.net.URI;

public interface JobProvider {
    JobSource source();

    ExtractedJob extract(URI uri);
}
