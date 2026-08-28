package com.landed.jobimport.dto;

import java.util.List;

public record JobImportResponse(
        String company,
        String role,
        String location,
        String employmentType,
        String experience,
        String salary,
        List<String> skills,
        String description
) {
    public static JobImportResponse empty() {
        return new JobImportResponse("", "", "", "", "", "", List.of(), "");
    }
}
