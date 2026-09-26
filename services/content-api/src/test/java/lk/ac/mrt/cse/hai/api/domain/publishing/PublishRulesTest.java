package lk.ac.mrt.cse.hai.api.domain.publishing;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentStatus;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import org.junit.jupiter.api.Test;

class PublishRulesTest {

    private static ContentItem item(ContentType type, String summary, String body, Map<String, Object> fields) {
        return new ContentItem("x_1", type, "slug", "Title", summary, body, fields, List.of(), ContentStatus.DRAFT, 1, null,
                "editor", Instant.EPOCH);
    }

    private static List<String> problemsFor(ContentItem item) {
        return PublishRules.check(new Snapshot(Map.of(item.type(), List.of(item)))).stream()
                .map(PublishValidationException.Problem::field).toList();
    }

    @Test
    void completePublicationPasses() {
        assertThat(problemsFor(item(ContentType.PUBLICATION, null, "Abstract", Map.of("category", "ETHICS", "year", 2025,
                "authors", "A. Author", "publishedIn", "CHI", "citation", "Author (2025)")))).isEmpty();
    }

    @Test
    void incompletePublicationListsEveryMissingField() {
        assertThat(problemsFor(item(ContentType.PUBLICATION, null, "", Map.of("category", "POETRY"))))
                .containsExactlyInAnyOrder("publication/x_1.category", "publication/x_1.year", "publication/x_1.authors",
                        "publication/x_1.publishedIn", "publication/x_1.citation", "publication/x_1.body");
    }

    @Test
    void themeNeedsTypeIconAndDescription() {
        assertThat(problemsFor(item(ContentType.THEME, "", null, Map.of("themeType", "CORE THEME"))))
                .containsExactlyInAnyOrder("theme/x_1.iconName", "theme/x_1.summary");
    }

    @Test
    void personNeedsAGroupAndRole() {
        assertThat(problemsFor(item(ContentType.MEMBER, null, null, Map.of("group", "alumni", "role", "Postdoc")))).isEmpty();
        assertThat(problemsFor(item(ContentType.MEMBER, null, null, Map.of("group", "visitors"))))
                .containsExactlyInAnyOrder("member/x_1.group", "member/x_1.role");
    }
}
