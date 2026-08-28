package com.landed.resume;

import com.landed.common.exception.BadRequestException;
import com.landed.resume.dto.DiffLine;
import com.landed.resume.dto.ResumeDiffResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ResumeDiffService {
    private static final int MAX_LINES = 2_000;

    public ResumeDiffResponse compare(ResumeVersion from, ResumeVersion to) {
        String[] oldLines = from.getTextContent().split("\\n", -1);
        String[] newLines = to.getTextContent().split("\\n", -1);
        if (oldLines.length > MAX_LINES || newLines.length > MAX_LINES) {
            throw new BadRequestException("Resume diff is limited to 2,000 lines per version");
        }

        int[][] lcs = new int[oldLines.length + 1][newLines.length + 1];
        for (int i = oldLines.length - 1; i >= 0; i--) {
            for (int j = newLines.length - 1; j >= 0; j--) {
                lcs[i][j] = oldLines[i].equals(newLines[j]) ? lcs[i + 1][j + 1]
                        : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
            }
        }

        List<DiffLine> lines = new ArrayList<>();
        int i = 0, j = 0, additions = 0, removals = 0;
        while (i < oldLines.length || j < newLines.length) {
            if (i < oldLines.length && j < newLines.length && oldLines[i].equals(newLines[j])) {
                lines.add(new DiffLine(DiffLine.DiffType.UNCHANGED, oldLines[i], i + 1, j + 1));
                i++; j++;
            } else if (j < newLines.length && (i == oldLines.length || lcs[i][j + 1] >= lcs[i + 1][j])) {
                lines.add(new DiffLine(DiffLine.DiffType.ADDED, newLines[j], null, j + 1));
                additions++; j++;
            } else {
                lines.add(new DiffLine(DiffLine.DiffType.REMOVED, oldLines[i], i + 1, null));
                removals++; i++;
            }
        }
        return new ResumeDiffResponse(from.getId(), to.getId(), additions, removals, Collections.unmodifiableList(lines));
    }
}
