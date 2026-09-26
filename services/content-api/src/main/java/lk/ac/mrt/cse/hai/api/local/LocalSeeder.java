package lk.ac.mrt.cse.hai.api.local;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;
import lk.ac.mrt.cse.hai.api.domain.content.ContentDraft;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentService;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

/**
 * Local development only: imports the website's built-in content (news Markdown, publications, research
 * themes and people) into any empty collection, then publishes so the website keeps showing it. A prototype
 * of the phase 3 migration. Never publishes over someone's unpublished edits.
 */
@Component
@Profile("local")
public class LocalSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalSeeder.class);
    private static final String SEED_USER = "local-seed";
    private static final DateTimeFormatter SITE_DATE = new DateTimeFormatterBuilder()
            .parseCaseInsensitive().appendPattern("MMMM d, yyyy").toFormatter(Locale.ENGLISH);
    private static final Map<String, String> MEMBER_GROUPS = new LinkedHashMap<>(Map.of(
            "teamMembers", "team", "foundingRAs", "founding-ra", "researchAssistants", "research-assistant",
            "studentResearchers", "student", "alumni", "alumni"));

    private final ContentService contents;
    private final PublishService publishing;
    private final ObjectMapper json;
    private final Path siteSource;

    public LocalSeeder(ContentService contents, PublishService publishing, ObjectMapper json,
            @Value("${hai.local.seed-dir}") String siteSource) {
        this.contents = contents;
        this.publishing = publishing;
        this.json = json;
        this.siteSource = Path.of(siteSource).toAbsolutePath().normalize();
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        if (!Files.isDirectory(siteSource)) {
            return;
        }
        List<String> imported = new ArrayList<>();
        if (isEmpty(ContentType.NEWS)) {
            imported.add(importNews() + " news articles");
        }
        if (isEmpty(ContentType.PUBLICATION)) {
            imported.add(importPublications() + " publications");
        }
        if (isEmpty(ContentType.THEME)) {
            imported.add(importThemes() + " research themes");
        }
        if (isEmpty(ContentType.MEMBER)) {
            imported.add(importPeople() + " people");
        }
        if (imported.isEmpty()) {
            return;
        }
        String summary = String.join(", ", imported);
        if (hasOtherUnpublishedChanges()) {
            log.info("Imported {} from {}. Not published automatically because other items have unpublished changes; publish from the dashboard.", summary, siteSource);
            return;
        }
        publishing.publish("Imported " + summary + " from the website's built-in content", SEED_USER);
        log.info("Imported {} from {} and published", summary, siteSource);
    }

    private boolean isEmpty(ContentType type) {
        return contents.list(type, null, 1).items().isEmpty();
    }

    private boolean hasOtherUnpublishedChanges() {
        for (ContentType type : ContentType.values()) {
            for (ContentItem item : contents.list(type, null, 1000).items()) {
                if (item.hasUnpublishedChanges() && !SEED_USER.equals(item.updatedBy())) {
                    return true;
                }
            }
        }
        return false;
    }

    // ------------------------------------------------------------------ news (Markdown with frontmatter)

    private int importNews() throws IOException {
        Path dir = siteSource.resolve("content/news");
        if (!Files.isDirectory(dir)) {
            return 0;
        }
        List<Path> files;
        try (Stream<Path> list = Files.list(dir)) {
            files = list.filter(f -> f.toString().endsWith(".md")).sorted().toList();
        }
        for (Path file : files) {
            String[] parts = Files.readString(file).split("(?m)^---\\s*$", 3);
            Map<String, Object> front = new Yaml().load(parts[1]);
            Map<String, Object> fields = new HashMap<>();
            fields.put("date", LocalDate.parse(String.valueOf(front.get("date")).strip(), SITE_DATE).toString());
            putIfPresent(fields, "imageUrl", front.get("imageUrl"));
            String slug = file.getFileName().toString().replaceFirst("\\.md$", "");
            create(ContentType.NEWS, slug, String.valueOf(front.get("title")), (String) front.get("content"), parts[2].strip(), fields);
        }
        return files.size();
    }

    // ------------------------------------------------------------------ publications and themes (JSON)

    private int importPublications() {
        List<Map<String, Object>> publications = readList("content/publications.json");
        for (int i = 0; i < publications.size(); i++) {
            Map<String, Object> p = publications.get(i);
            Map<String, Object> fields = new HashMap<>();
            for (String key : List.of("category", "authors", "publishedIn", "year", "keyFindings", "citation", "imageUrl")) {
                putIfPresent(fields, key, p.get(key));
            }
            fields.put("order", i + 1);
            create(ContentType.PUBLICATION, (String) p.get("id"), (String) p.get("title"), null, (String) p.get("abstract"), fields);
        }
        return publications.size();
    }

    private int importThemes() {
        List<Map<String, Object>> themes = readList("content/themes.json");
        for (int i = 0; i < themes.size(); i++) {
            Map<String, Object> t = themes.get(i);
            Map<String, Object> fields = new HashMap<>();
            fields.put("themeType", t.get("type"));
            for (String key : List.of("iconName", "imageUrl", "bgClass", "textClass", "projects", "leadResearcher")) {
                putIfPresent(fields, key, t.get(key));
            }
            fields.put("order", i + 1);
            create(ContentType.THEME, (String) t.get("id"), (String) t.get("title"), (String) t.get("description"),
                    (String) t.get("detailedDescription"), fields);
        }
        return themes.size();
    }

    // ------------------------------------------------------------------ people (data.json groups)

    private int importPeople() throws IOException {
        Path file = siteSource.resolve("data.json");
        if (!Files.exists(file)) {
            return 0;
        }
        Map<String, List<Map<String, Object>>> data = json.readValue(file.toFile(), new TypeReference<>() {});
        int count = 0;
        java.util.Set<String> usedSlugs = new java.util.HashSet<>();
        for (var group : MEMBER_GROUPS.entrySet()) {
            List<Map<String, Object>> people = data.getOrDefault(group.getKey(), List.of());
            for (int i = 0; i < people.size(); i++) {
                Map<String, Object> person = people.get(i);
                Map<String, Object> fields = new HashMap<>();
                fields.put("group", group.getValue());
                fields.put("order", i + 1);
                putIfPresent(fields, "role", person.get("role"));
                putIfPresent(fields, "jobTitle", person.get("title"));
                for (String key : List.of("expertise", "imageUrl", "topic", "period", "currentPosition")) {
                    putIfPresent(fields, key, person.get(key));
                }
                if (person.get("socials") instanceof Map<?, ?> socials) {
                    for (String key : List.of("email", "linkedin", "scholar")) {
                        putIfPresent(fields, key, socials.get(key));
                    }
                }
                String name = (String) person.get("name");
                // Ids aren't shown on the site; a missing or duplicate one becomes an address made from the name.
                String slug = person.get("id") instanceof String id && !usedSlugs.contains(id) ? id : slugify(name);
                usedSlugs.add(slug);
                create(ContentType.MEMBER, slug, name, null, (String) person.get("bio"), fields);
                count++;
            }
        }
        return count;
    }

    // ------------------------------------------------------------------ helpers

    private void create(ContentType type, String slug, String title, String summary, String body, Map<String, Object> fields) {
        contents.create(type, new ContentDraft(slug, title, summary, body, fields, List.of()), SEED_USER);
    }

    private List<Map<String, Object>> readList(String relativePath) {
        Path file = siteSource.resolve(relativePath);
        return Files.exists(file) ? json.readValue(file.toFile(), new TypeReference<>() {}) : List.of();
    }

    private static void putIfPresent(Map<String, Object> fields, String key, Object value) {
        if (value != null && !(value instanceof String s && s.isBlank())) {
            fields.put(key, value);
        }
    }

    private static String slugify(String text) {
        return Normalizer.normalize(text, Normalizer.Form.NFKD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
    }
}
