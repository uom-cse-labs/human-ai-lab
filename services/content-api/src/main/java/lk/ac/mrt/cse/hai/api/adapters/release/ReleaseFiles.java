package lk.ac.mrt.cse.hai.api.adapters.release;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedImage;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedMembersFile;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedNewsFile;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedNewsItem;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedPerson;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedPublication;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedPublicationsFile;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedSocialLinks;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedTheme;
import lk.ac.mrt.cse.hai.api.contract.model.PublishedThemesFile;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.publishing.Snapshot;
import tools.jackson.databind.ObjectMapper;

/**
 * Turns a snapshot into the release files the website reads, in the shapes defined by the contract.
 * Shared by every release store (local folder now, S3 in AWS), so the files are identical everywhere.
 */
public final class ReleaseFiles {

    private ReleaseFiles() {}

    /** Release files never contain nulls: the website treats a missing field and null differently. */
    public static ObjectMapper writer(ObjectMapper base) {
        return base.rebuild()
                .changeDefaultPropertyInclusion(incl -> incl.withValueInclusion(JsonInclude.Include.NON_NULL))
                .build();
    }

    /** File name → content, e.g. "news.json" → PublishedNewsFile. */
    public static Map<String, Object> of(Snapshot snapshot) {
        Map<String, Object> files = new LinkedHashMap<>();
        files.put("news.json", news(snapshot.of(ContentType.NEWS)));
        files.put("publications.json", publications(snapshot.of(ContentType.PUBLICATION)));
        files.put("themes.json", themes(snapshot.of(ContentType.THEME)));
        files.put("members.json", members(snapshot.of(ContentType.MEMBER)));
        return files;
    }

    static PublishedNewsFile news(List<ContentItem> news) {
        List<PublishedNewsItem> items = news.stream()
                .map(n -> {
                    PublishedNewsItem item = new PublishedNewsItem()
                            .id(n.id())
                            .slug(n.slug())
                            .title(n.title())
                            .date(LocalDate.parse(text(n, "date")))
                            .summary(n.summary())
                            .body(n.body());
                    String image = text(n, "imageUrl");
                    if (!image.isEmpty()) {
                        item.cover(new PublishedImage().src(image).alt(n.title()));
                    }
                    return item;
                })
                .sorted(Comparator.comparing(PublishedNewsItem::getDate).reversed())
                .toList();
        return new PublishedNewsFile().schema(PublishedNewsFile.SchemaEnum.NUMBER_1).items(items);
    }

    static PublishedPublicationsFile publications(List<ContentItem> publications) {
        List<PublishedPublication> items = ordered(publications).stream()
                .map(p -> new PublishedPublication()
                        .id(p.slug())
                        .title(p.title())
                        .category(PublishedPublication.CategoryEnum.fromValue(text(p, "category")))
                        .authors(text(p, "authors"))
                        .publishedIn(text(p, "publishedIn"))
                        .year(((Number) p.fields().get("year")).intValue())
                        ._abstract(p.body())
                        .keyFindings(list(p, "keyFindings"))
                        .citation(text(p, "citation"))
                        .imageUrl(optional(p, "imageUrl")))
                .toList();
        return new PublishedPublicationsFile().schema(PublishedPublicationsFile.SchemaEnum.NUMBER_1).items(items);
    }

    static PublishedThemesFile themes(List<ContentItem> themes) {
        List<PublishedTheme> items = ordered(themes).stream()
                .map(t -> new PublishedTheme()
                        .id(t.slug())
                        .title(t.title())
                        .type(PublishedTheme.TypeEnum.fromValue(text(t, "themeType")))
                        .description(t.summary())
                        .iconName(PublishedTheme.IconNameEnum.fromValue(text(t, "iconName")))
                        .imageUrl(optional(t, "imageUrl"))
                        .bgClass(text(t, "bgClass"))
                        .textClass(text(t, "textClass"))
                        .detailedDescription(t.body() == null ? "" : t.body())
                        .projects(list(t, "projects"))
                        .leadResearcher(text(t, "leadResearcher")))
                .toList();
        return new PublishedThemesFile().schema(PublishedThemesFile.SchemaEnum.NUMBER_1).items(items);
    }

    static PublishedMembersFile members(List<ContentItem> members) {
        List<ContentItem> sorted = ordered(members);
        return new PublishedMembersFile()
                .schema(PublishedMembersFile.SchemaEnum.NUMBER_1)
                .teamMembers(group(sorted, "team"))
                .foundingRAs(group(sorted, "founding-ra"))
                .researchAssistants(group(sorted, "research-assistant"))
                .studentResearchers(group(sorted, "student"))
                .alumni(group(sorted, "alumni"));
    }

    private static List<PublishedPerson> group(List<ContentItem> members, String group) {
        return members.stream()
                .filter(m -> group.equals(text(m, "group")))
                .map(m -> {
                    PublishedSocialLinks socials = new PublishedSocialLinks()
                            .email(optional(m, "email"))
                            .linkedin(optional(m, "linkedin"))
                            .scholar(optional(m, "scholar"));
                    boolean hasSocials = socials.getEmail() != null || socials.getLinkedin() != null || socials.getScholar() != null;
                    return new PublishedPerson()
                            .id(m.slug())
                            .name(m.title())
                            .role(text(m, "role"))
                            .title(optional(m, "jobTitle"))
                            .bio(m.body() == null || m.body().isBlank() ? null : m.body())
                            .expertise(optional(m, "expertise"))
                            .imageUrl(optional(m, "imageUrl"))
                            .topic(optional(m, "topic"))
                            .period(optional(m, "period"))
                            .currentPosition(optional(m, "currentPosition"))
                            .socials(hasSocials ? socials : null);
                })
                .toList();
    }

    /** Editors set the display order with the "order" field; ties fall back to the title. */
    private static List<ContentItem> ordered(List<ContentItem> items) {
        return items.stream()
                .sorted(Comparator.comparingDouble(ReleaseFiles::order).thenComparing(ContentItem::title))
                .toList();
    }

    private static double order(ContentItem item) {
        return item.fields().get("order") instanceof Number n ? n.doubleValue() : Double.MAX_VALUE;
    }

    private static String text(ContentItem item, String field) {
        return item.fields().get(field) instanceof String s ? s.strip() : "";
    }

    private static String optional(ContentItem item, String field) {
        String value = text(item, field);
        return value.isEmpty() ? null : value;
    }

    private static List<String> list(ContentItem item, String field) {
        return item.fields().get(field) instanceof List<?> values
                ? values.stream().map(String::valueOf).map(String::strip).filter(v -> !v.isEmpty()).toList()
                : List.of();
    }
}
