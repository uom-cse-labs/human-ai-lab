package lk.ac.mrt.cse.hai.api.domain.publishing;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;

/**
 * What each content type needs before it can go live. Drafts may be incomplete; these rules run at publish
 * time, and every broken rule is reported so editors can fix everything in one pass.
 */
public final class PublishRules {

    public static final Set<String> PUBLICATION_CATEGORIES = Set.of("INTELLIGENCE", "ETHICS", "DESIGN", "ROBOTICS");
    public static final Set<String> THEME_TYPES = Set.of("CORE THEME", "NEW INITIATIVE");
    public static final Set<String> THEME_ICONS = Set.of("robot", "brain", "shield", "eye");
    public static final Set<String> MEMBER_GROUPS = Set.of("team", "founding-ra", "research-assistant", "student", "alumni");

    private PublishRules() {}

    public static List<PublishValidationException.Problem> check(Snapshot snapshot) {
        List<PublishValidationException.Problem> problems = new ArrayList<>();
        for (ContentItem item : snapshot.of(ContentType.NEWS)) {
            if (!(text(item, "date")).matches("\\d{4}-\\d{2}-\\d{2}")) {
                problems.add(problem(item, "date", "needs a date (YYYY-MM-DD)."));
            }
        }
        for (ContentItem item : snapshot.of(ContentType.PUBLICATION)) {
            requireOneOf(problems, item, "category", PUBLICATION_CATEGORIES);
            if (!(item.fields().get("year") instanceof Number year) || year.intValue() < 1900 || year.intValue() > 2100) {
                problems.add(problem(item, "year", "needs a publication year."));
            }
            requireText(problems, item, "authors", "needs its authors.");
            requireText(problems, item, "publishedIn", "needs the venue or journal it was published in.");
            requireText(problems, item, "citation", "needs a citation.");
            if (blank(item.body())) {
                problems.add(problem(item, "body", "needs an abstract."));
            }
        }
        for (ContentItem item : snapshot.of(ContentType.THEME)) {
            requireOneOf(problems, item, "themeType", THEME_TYPES);
            requireOneOf(problems, item, "iconName", THEME_ICONS);
            if (blank(item.summary())) {
                problems.add(problem(item, "summary", "needs a short description."));
            }
        }
        for (ContentItem item : snapshot.of(ContentType.MEMBER)) {
            requireOneOf(problems, item, "group", MEMBER_GROUPS);
            requireText(problems, item, "role", "needs a role.");
        }
        return problems;
    }

    public static String text(ContentItem item, String field) {
        return item.fields().get(field) instanceof String s ? s.strip() : "";
    }

    private static void requireText(List<PublishValidationException.Problem> problems, ContentItem item, String field, String message) {
        if (text(item, field).isEmpty()) {
            problems.add(problem(item, field, message));
        }
    }

    private static void requireOneOf(List<PublishValidationException.Problem> problems, ContentItem item, String field, Set<String> allowed) {
        if (!allowed.contains(text(item, field))) {
            problems.add(problem(item, field, "needs a valid " + field + "."));
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static PublishValidationException.Problem problem(ContentItem item, String field, String message) {
        return new PublishValidationException.Problem(
                item.type().key() + "/" + item.id() + "." + field, "\"" + item.title() + "\" " + message);
    }
}
