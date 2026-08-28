package com.landed.resumeperformance.dto;

import java.util.UUID;

public record ResumePerformanceResponse(
        UUID resumeId,
        String resumeName,
        int applications,
        int interviews,
        int offers,
        int conversionRate
) {
}
