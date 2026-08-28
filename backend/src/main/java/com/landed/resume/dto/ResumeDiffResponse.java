package com.landed.resume.dto;

import java.util.List;
import java.util.UUID;

public record ResumeDiffResponse(UUID fromVersionId, UUID toVersionId, int additions, int removals,
                                 List<DiffLine> lines) {
}
