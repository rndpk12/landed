package com.landed.resume;

import com.landed.common.exception.UnprocessableEntityException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Component
public class ResumeTextExtractor {
    private static final int MAX_TEXT_LENGTH = 200_000;

    public String extract(byte[] bytes, String extension) {
        try {
            String text = switch (extension) {
                case "pdf" -> extractPdf(bytes);
                case "docx" -> extractDocx(bytes);
                case "txt" -> new String(bytes, StandardCharsets.UTF_8);
                default -> throw new UnprocessableEntityException("Unsupported resume format");
            };
            String normalized = text.replace("\r\n", "\n").replace('\r', '\n').strip();
            if (normalized.isBlank()) {
                throw new UnprocessableEntityException("No readable text was found in the resume");
            }
            return normalized.length() > MAX_TEXT_LENGTH ? normalized.substring(0, MAX_TEXT_LENGTH) : normalized;
        } catch (UnprocessableEntityException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new UnprocessableEntityException("The resume file could not be read", exception);
        }
    }

    private String extractPdf(byte[] bytes) throws Exception {
        try (var document = Loader.loadPDF(bytes)) {
            if (document.isEncrypted()) throw new UnprocessableEntityException("Encrypted PDFs are not supported");
            return new PDFTextStripper().getText(document);
        }
    }

    private String extractDocx(byte[] bytes) throws Exception {
        try (var document = new XWPFDocument(new ByteArrayInputStream(bytes))) {
            return document.getParagraphs().stream().map(XWPFParagraph::getText).collect(Collectors.joining("\n"));
        }
    }
}
