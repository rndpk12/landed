package com.landed.resume.dto;

public record DiffLine(DiffType type, String text, Integer oldLineNumber, Integer newLineNumber) {
    public enum DiffType { UNCHANGED, ADDED, REMOVED }
}
