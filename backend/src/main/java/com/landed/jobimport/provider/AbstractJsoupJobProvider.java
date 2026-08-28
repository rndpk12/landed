package com.landed.jobimport.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

abstract class AbstractJsoupJobProvider implements JobProvider {
    private static final int TIMEOUT_MS = 8_000;
    private static final List<String> SKILL_KEYWORDS = List.of(
            "Java", "Spring", "Spring Boot", "React", "TypeScript", "JavaScript", "Node.js", "Python",
            "SQL", "PostgreSQL", "MySQL", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "GraphQL",
            "REST", "Kafka", "Redis", "MongoDB", "Machine Learning", "AI", "Data Analysis", "Excel",
            "Figma", "Product Management", "Agile", "Communication"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ExtractedJob extract(URI uri) {
        try {
            Document document = Jsoup.connect(uri.toString())
                    .userAgent("LandedJobImporter/1.0 (+https://landed.local)")
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .get();
            return extractFromDocument(uri, document);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not import this job URL. The page may block automated access.", exception);
        }
    }

    protected ExtractedJob extractFromDocument(URI uri, Document document) {
        JsonNode jobPosting = firstJobPosting(document);
        String pageText = document.body() == null ? "" : document.body().text();
        String description = firstPresent(
                jsonText(jobPosting, "description"),
                text(document, descriptionSelectors()),
                meta(document, "description"),
                pageText
        );

        String role = clean(firstPresent(
                jsonText(jobPosting, "title"),
                text(document, roleSelectors()),
                meta(document, "og:title"),
                document.title()
        ));

        String company = clean(firstPresent(
                hiringOrganization(jobPosting),
                text(document, companySelectors()),
                meta(document, "og:site_name"),
                companyFromHost(uri)
        ));

        return new ExtractedJob(
                company,
                role,
                clean(firstPresent(jsonLocation(jobPosting), text(document, locationSelectors()))),
                clean(firstPresent(jsonText(jobPosting, "employmentType"), text(document, employmentTypeSelectors()))),
                clean(firstPresent(text(document, experienceSelectors()), findExperience(pageText))),
                clean(firstPresent(jsonSalary(jobPosting), findSalary(pageText))),
                extractSkills(description + " " + pageText),
                clean(description)
        );
    }

    protected List<String> roleSelectors() {
        return List.of("h1", "[data-qa='job-title']", ".job-title", ".posting-headline h2", ".app-title", "[class*=job-title]");
    }

    protected List<String> companySelectors() {
        return List.of("[data-qa='company-name']", ".company-name", ".posting-company", "[class*=company]");
    }

    protected List<String> locationSelectors() {
        return List.of("[data-qa='location']", ".location", ".posting-categories .location", "[class*=location]");
    }

    protected List<String> employmentTypeSelectors() {
        return List.of("[data-qa='employment-type']", ".employment-type", "[class*=employment]", "[class*=job-type]");
    }

    protected List<String> experienceSelectors() {
        return List.of("[class*=experience]", "[data-qa*=experience]");
    }

    protected List<String> descriptionSelectors() {
        return List.of("[data-qa='job-description']", ".job-description", ".description", ".posting-page", "#content", "main", "article");
    }

    protected String text(Document document, List<String> selectors) {
        for (String selector : selectors) {
            Elements elements = document.select(selector);
            for (Element element : elements) {
                String value = clean(element.text());
                if (!value.isBlank()) {
                    return value;
                }
            }
        }
        return "";
    }

    protected String meta(Document document, String property) {
        String content = document.select("meta[property=" + property + "]").attr("content");
        if (content.isBlank()) {
            content = document.select("meta[name=" + property + "]").attr("content");
        }
        return clean(content);
    }

    protected String firstPresent(String... values) {
        for (String value : values) {
            String cleaned = clean(value);
            if (!cleaned.isBlank()) {
                return cleaned;
            }
        }
        return "";
    }

    protected String clean(String value) {
        return value == null ? "" : value.replace('\u00a0', ' ').replaceAll("\\s+", " ").trim();
    }

    private JsonNode firstJobPosting(Document document) {
        for (Element script : document.select("script[type='application/ld+json']")) {
            JsonNode root = parseJson(script.data());
            JsonNode found = findJobPosting(root);
            if (found != null) {
                return found;
            }
        }
        return null;
    }

    private JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception ignored) {
            return null;
        }
    }

    private JsonNode findJobPosting(JsonNode node) {
        if (node == null) {
            return null;
        }
        if (node.isArray()) {
            for (JsonNode child : node) {
                JsonNode found = findJobPosting(child);
                if (found != null) {
                    return found;
                }
            }
        }
        if (node.isObject()) {
            JsonNode type = node.get("@type");
            if (type != null && type.asText("").equalsIgnoreCase("JobPosting")) {
                return node;
            }
            JsonNode graph = node.get("@graph");
            if (graph != null) {
                return findJobPosting(graph);
            }
        }
        return null;
    }

    private String jsonText(JsonNode node, String field) {
        JsonNode value = node == null ? null : node.get(field);
        if (value == null) {
            return "";
        }
        if (value.isArray()) {
            List<String> values = new ArrayList<>();
            value.forEach(item -> values.add(item.asText("")));
            return String.join(", ", values);
        }
        return clean(value.asText(""));
    }

    private String hiringOrganization(JsonNode node) {
        JsonNode organization = node == null ? null : node.get("hiringOrganization");
        if (organization == null) {
            return "";
        }
        if (organization.isTextual()) {
            return organization.asText("");
        }
        return jsonText(organization, "name");
    }

    private String jsonLocation(JsonNode node) {
        JsonNode location = node == null ? null : node.get("jobLocation");
        if (location == null) {
            return "";
        }
        JsonNode address = location.isArray() && !location.isEmpty() ? location.get(0).get("address") : location.get("address");
        if (address == null) {
            return "";
        }
        return firstPresent(jsonText(address, "addressLocality"), jsonText(address, "addressRegion"), jsonText(address, "addressCountry"));
    }

    private String jsonSalary(JsonNode node) {
        JsonNode baseSalary = node == null ? null : node.get("baseSalary");
        if (baseSalary == null) {
            return "";
        }
        return clean(baseSalary.toString());
    }

    private List<String> extractSkills(String text) {
        String haystack = text.toLowerCase(Locale.ROOT);
        Set<String> skills = new LinkedHashSet<>();
        for (String skill : SKILL_KEYWORDS) {
            if (haystack.contains(skill.toLowerCase(Locale.ROOT))) {
                skills.add(skill);
            }
        }
        return List.copyOf(skills);
    }

    private String findExperience(String text) {
        return findPattern(text, "(?i)(\\d+\\+?\\s*(?:-|to)?\\s*\\d*\\+?\\s*years?[^.]{0,40})");
    }

    private String findSalary(String text) {
        return findPattern(text, "(?i)((?:\\$|₹|INR|USD)\\s?[\\d,.]+\\s?(?:k|lpa|lakhs?|pa|per annum)?(?:\\s?-\\s?(?:\\$|₹|INR|USD)?\\s?[\\d,.]+\\s?(?:k|lpa|lakhs?|pa|per annum)?)?)");
    }

    private String findPattern(String text, String regex) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(regex).matcher(text);
        return matcher.find() ? clean(matcher.group(1)) : "";
    }

    private String companyFromHost(URI uri) {
        String host = uri.getHost() == null ? "" : uri.getHost().replaceFirst("^www\\.", "");
        String[] parts = host.split("\\.");
        return parts.length == 0 ? "" : parts[0];
    }
}
