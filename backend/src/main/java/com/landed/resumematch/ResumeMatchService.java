package com.landed.resumematch;

import com.landed.activity.ActivityService;
import com.landed.activity.ActivityType;
import com.landed.common.exception.BadRequestException;
import com.landed.common.exception.ResourceNotFoundException;
import com.landed.resume.Resume;
import com.landed.resume.ResumeRepository;
import com.landed.resume.ResumeVersion;
import com.landed.resume.ResumeProcessingStatus;
import com.landed.resumematch.dto.ResumeMatchAnalyzeRequest;
import com.landed.resumematch.dto.ResumeMatchAnalyzeResponse;
import com.landed.user.User;
import com.landed.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeMatchService {
    private static final Pattern TOKEN_SPLIT = Pattern.compile("[^a-z0-9+#.]+");
    private static final int MAX_KEYWORDS = 20;
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is",
            "it", "of", "on", "or", "our", "that", "the", "their", "this", "to", "with", "you", "your",
            "we", "will", "work", "working", "team", "teams", "role", "candidate", "candidates", "job",
            "description", "experience", "years", "strong", "excellent", "good", "great", "ability", "skills",
            "skill", "responsibilities", "requirements", "required", "preferred", "plus", "including", "using"
    );

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public ResumeMatchService(ResumeRepository resumeRepository, UserRepository userRepository,
                              ActivityService activityService) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional
    public ResumeMatchAnalyzeResponse analyze(String email, ResumeMatchAnalyzeRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Resume resume = resumeRepository.findDistinctByIdAndUserId(request.resumeId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        ResumeVersion version = latestVersion(resume);
        if (version.getProcessingStatus() == ResumeProcessingStatus.PENDING) {
            throw new BadRequestException("Resume text is still processing. Try again shortly.");
        }
        if (version.getProcessingStatus() == ResumeProcessingStatus.FAILED) {
            throw new BadRequestException("Resume text could not be processed. Upload the file again.");
        }

        List<String> resumeTokens = tokenize(version.getTextContent());
        List<String> jobTokens = tokenize(request.jobDescription());
        if (resumeTokens.isEmpty()) {
            throw new BadRequestException("Stored resume does not contain readable text");
        }
        if (jobTokens.isEmpty()) {
            throw new BadRequestException("Job description does not contain enough keywords to analyze");
        }

        Map<String, Double> resumeVector = tfIdfVector(resumeTokens, jobTokens);
        Map<String, Double> jobVector = tfIdfVector(jobTokens, resumeTokens);
        double cosineSimilarity = cosineSimilarity(resumeVector, jobVector);

        List<String> jobKeywords = extractKeywords(jobTokens);
        Set<String> resumeVocabulary = new HashSet<>(resumeTokens);
        List<String> matchedKeywords = jobKeywords.stream()
                .filter(resumeVocabulary::contains)
                .toList();
        List<String> missingKeywords = jobKeywords.stream()
                .filter(keyword -> !resumeVocabulary.contains(keyword))
                .toList();
        double keywordCoverage = jobKeywords.isEmpty() ? 0 : (double) matchedKeywords.size() / jobKeywords.size();
        int matchScore = clampScore(Math.round((cosineSimilarity * 0.70 + keywordCoverage * 0.30) * 100));
        activityService.record(user, ActivityType.RESUME_MATCH_RUN, "Resume match run",
                resume.getName() + " scored " + matchScore + "%", resume.getId());

        return new ResumeMatchAnalyzeResponse(
                matchScore,
                matchedKeywords,
                missingKeywords,
                suggestions(matchScore, matchedKeywords, missingKeywords, resumeVocabulary, request.jobDescription())
        );
    }

    private ResumeVersion latestVersion(Resume resume) {
        return resume.getVersions().stream()
                .max(Comparator.comparingInt(ResumeVersion::getVersionNumber))
                .orElseThrow(() -> new BadRequestException("Resume has no uploaded versions"));
    }

    private List<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        return TOKEN_SPLIT.splitAsStream(text.toLowerCase(Locale.ROOT))
                .map(String::trim)
                .map(this::stripBoundaryPunctuation)
                .filter(token -> token.length() >= 2)
                .filter(token -> !STOP_WORDS.contains(token))
                .toList();
    }

    private String stripBoundaryPunctuation(String token) {
        return token.replaceAll("^[^a-z0-9+#]+|[^a-z0-9+#]+$", "");
    }

    private Map<String, Double> tfIdfVector(List<String> primaryDocument, List<String> comparisonDocument) {
        Map<String, Long> frequencies = primaryDocument.stream()
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        int documentLength = primaryDocument.size();
        Set<String> primaryVocabulary = new HashSet<>(primaryDocument);
        Set<String> comparisonVocabulary = new HashSet<>(comparisonDocument);
        Set<String> vocabulary = new LinkedHashSet<>(primaryVocabulary);
        vocabulary.addAll(comparisonVocabulary);

        Map<String, Double> vector = new HashMap<>();
        for (String term : vocabulary) {
            double termFrequency = frequencies.getOrDefault(term, 0L) / (double) documentLength;
            int documentFrequency = (primaryVocabulary.contains(term) ? 1 : 0) + (comparisonVocabulary.contains(term) ? 1 : 0);
            double inverseDocumentFrequency = Math.log((1.0 + 2) / (1.0 + documentFrequency)) + 1.0;
            vector.put(term, termFrequency * inverseDocumentFrequency);
        }
        return vector;
    }

    private double cosineSimilarity(Map<String, Double> left, Map<String, Double> right) {
        Set<String> vocabulary = new HashSet<>(left.keySet());
        vocabulary.addAll(right.keySet());

        double dotProduct = 0;
        double leftMagnitude = 0;
        double rightMagnitude = 0;
        for (String term : vocabulary) {
            double leftWeight = left.getOrDefault(term, 0.0);
            double rightWeight = right.getOrDefault(term, 0.0);
            dotProduct += leftWeight * rightWeight;
            leftMagnitude += leftWeight * leftWeight;
            rightMagnitude += rightWeight * rightWeight;
        }

        if (leftMagnitude == 0 || rightMagnitude == 0) {
            return 0;
        }
        return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
    }

    private List<String> extractKeywords(List<String> jobTokens) {
        return jobTokens.stream()
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .limit(MAX_KEYWORDS)
                .map(Map.Entry::getKey)
                .toList();
    }

    private List<String> suggestions(int score, List<String> matchedKeywords, List<String> missingKeywords,
                                     Set<String> resumeVocabulary, String jobDescription) {
        List<String> suggestions = new ArrayList<>();

        if (!missingKeywords.isEmpty()) {
            suggestions.add("Add role-relevant keywords from the job description: " + String.join(", ", missingKeywords.stream().limit(8).toList()) + ".");
        }
        if (score < 70) {
            suggestions.add("Tailor the resume summary and recent experience bullets to mirror this job's core requirements.");
        }
        if (matchedKeywords.size() < 5) {
            suggestions.add("Include more exact-match technical terms where they truthfully reflect your experience.");
        }
        if (!containsAny(resumeVocabulary, Set.of("impact", "metrics", "revenue", "latency", "performance", "scale", "reduced", "increased"))) {
            suggestions.add("Add measurable impact to bullets, such as scale, latency, revenue, cost, or conversion improvements.");
        }
        if (jobDescription.toLowerCase(Locale.ROOT).contains("lead") && !containsAny(resumeVocabulary, Set.of("led", "lead", "mentored", "owned"))) {
            suggestions.add("Highlight leadership signals such as ownership, mentoring, technical direction, or cross-functional delivery.");
        }
        if (suggestions.isEmpty()) {
            suggestions.add("Strong match. Keep keywords natural and make sure the most relevant achievements appear near the top.");
        }

        return suggestions;
    }

    private boolean containsAny(Set<String> vocabulary, Set<String> candidates) {
        return candidates.stream().anyMatch(vocabulary::contains);
    }

    private int clampScore(long score) {
        return (int) Math.max(0, Math.min(100, score));
    }
}
