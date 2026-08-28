package com.landed.resumematch.dto;

import java.util.List;

public record ResumeMatchAnalyzeResponse(
        int matchScore,
        List<String> matchedKeywords,
        List<String> missingKeywords,
        List<String> suggestions
) {
}
