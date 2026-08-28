package com.landed.jobimport.provider;

import java.util.List;

public record ExtractedJob(
        String company,
        String role,
        String location,
        String employmentType,
        String experience,
        String salary,
        List<String> skills,
        String description
) {
}
