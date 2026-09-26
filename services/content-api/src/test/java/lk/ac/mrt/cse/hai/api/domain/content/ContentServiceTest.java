package lk.ac.mrt.cse.hai.api.domain.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import lk.ac.mrt.cse.hai.api.domain.shared.NotFoundException;
import org.junit.jupiter.api.Test;

class ContentServiceTest {

    private final InMemoryContentRepository repository = new InMemoryContentRepository();
    private final ContentService service =
            new ContentService(repository, Clock.fixed(Instant.parse("2026-10-01T10:00:00Z"), ZoneOffset.UTC));

    private static ContentDraft draft(String slug, String title) {
        return new ContentDraft(slug, title, "Summary", "Body", Map.of("date", "2026-10-01"), List.of());
    }

    @Test
    void newItemsStartAsVersionOneDrafts() {
        ContentItem item = service.create(ContentType.NEWS, draft("open-day", "Open day"), "asha");

        assertThat(item.status()).isEqualTo(ContentStatus.DRAFT);
        assertThat(item.version()).isEqualTo(1);
        assertThat(item.publishedVersion()).isNull();
        assertThat(item.updatedBy()).isEqualTo("asha");
        assertThat(item.id()).startsWith("n_");
    }

    @Test
    void savingBumpsTheVersionAndKeepsThePublishedVersion() {
        ContentItem item = service.create(ContentType.NEWS, draft("open-day", "Open day"), "asha");

        ContentItem saved = service.update(ContentType.NEWS, item.id(), draft("open-day", "Open day 2026"), 1, "ravi");

        assertThat(saved.version()).isEqualTo(2);
        assertThat(saved.title()).isEqualTo("Open day 2026");
        assertThat(saved.updatedBy()).isEqualTo("ravi");
    }

    @Test
    void aStaleSaveIsRejectedWithTheLatestVersion() {
        ContentItem item = service.create(ContentType.NEWS, draft("open-day", "Open day"), "asha");
        service.update(ContentType.NEWS, item.id(), draft("open-day", "Asha's edit"), 1, "asha");

        assertThatThrownBy(() -> service.update(ContentType.NEWS, item.id(), draft("open-day", "Ravi's edit"), 1, "ravi"))
                .isInstanceOfSatisfying(VersionConflictException.class, e -> {
                    assertThat(e.current().version()).isEqualTo(2);
                    assertThat(e.current().title()).isEqualTo("Asha's edit");
                });
    }

    @Test
    void slugsAreUniquePerType() {
        service.create(ContentType.NEWS, draft("open-day", "Open day"), "asha");

        assertThatThrownBy(() -> service.create(ContentType.NEWS, draft("open-day", "Another"), "asha"))
                .isInstanceOfSatisfying(ContentRuleException.class, e -> assertThat(e.code()).isEqualTo("SLUG_TAKEN"));
        // The same slug is fine for a different content type.
        assertThat(service.create(ContentType.PROJECT, draft("open-day", "Project"), "asha")).isNotNull();
    }

    @Test
    void liveItemsCannotBeDeleted() {
        ContentItem item = service.create(ContentType.NEWS, draft("open-day", "Open day"), "asha");
        repository.save(new ContentItem(item.id(), item.type(), item.slug(), item.title(), item.summary(), item.body(),
                item.fields(), item.mediaRefs(), ContentStatus.PUBLISHED, 1, 1, "asha", item.updatedAt()), 1);

        assertThatThrownBy(() -> service.delete(ContentType.NEWS, item.id()))
                .isInstanceOfSatisfying(ContentRuleException.class, e -> assertThat(e.code()).isEqualTo("INVALID_STATE"));

        service.unpublish(ContentType.NEWS, item.id(), "admin");
        service.delete(ContentType.NEWS, item.id());
        assertThatThrownBy(() -> service.get(ContentType.NEWS, item.id())).isInstanceOf(NotFoundException.class);
    }
}
