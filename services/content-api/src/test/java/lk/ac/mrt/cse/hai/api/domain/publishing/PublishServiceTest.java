package lk.ac.mrt.cse.hai.api.domain.publishing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lk.ac.mrt.cse.hai.api.domain.content.ContentDraft;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentService;
import lk.ac.mrt.cse.hai.api.domain.content.ContentStatus;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.content.InMemoryContentRepository;
import org.junit.jupiter.api.Test;

public class PublishServiceTest {

    private final Clock clock = Clock.fixed(Instant.parse("2026-10-02T09:15:00Z"), ZoneOffset.UTC);
    private final InMemoryContentRepository repository = new InMemoryContentRepository();
    private final ContentService contents = new ContentService(repository, clock);
    private final RecordingStore store = new RecordingStore();
    private final MemoryLog log = new MemoryLog();
    private final SwitchLock lock = new SwitchLock();
    private final PublishService publishing = new PublishService(repository, store, log, lock, clock);

    private ContentItem news(String slug, String date) {
        return contents.create(ContentType.NEWS, new ContentDraft(slug, slug, null, "Body",
                date == null ? Map.of() : Map.of("date", date), List.of()), "editor");
    }

    @Test
    void writesTheReleaseBeforeSwitchingThePointer() {
        news("open-day", "2026-10-01");

        Release release = publishing.publish("First", "admin");

        assertThat(release.id()).isEqualTo("2026-10-02T09-15-00Z");
        assertThat(store.events).containsExactly("write " + release.id(), "point " + release.id());
        assertThat(log.list()).containsExactly(release);
    }

    @Test
    void publishedItemsRecordTheVersionThatWentLive() {
        ContentItem item = news("open-day", "2026-10-01");

        publishing.publish(null, "admin");

        ContentItem after = repository.get(ContentType.NEWS, item.id()).orElseThrow();
        assertThat(after.status()).isEqualTo(ContentStatus.PUBLISHED);
        assertThat(after.publishedVersion()).isEqualTo(after.version());
        assertThat(after.hasUnpublishedChanges()).isFalse();
    }

    @Test
    void unpublishedItemsAreLeftOut() {
        news("open-day", "2026-10-01");
        ContentItem hidden = news("old-news", "2025-01-01");
        contents.unpublish(ContentType.NEWS, hidden.id(), "admin");

        publishing.publish(null, "admin");

        assertThat(store.lastSnapshot.of(ContentType.NEWS)).extracting(ContentItem::slug).containsExactly("open-day");
    }

    @Test
    void invalidContentPublishesNothing() {
        news("no-date", null);

        assertThatThrownBy(() -> publishing.publish(null, "admin"))
                .isInstanceOfSatisfying(PublishValidationException.class,
                        e -> assertThat(e.problems()).singleElement().satisfies(p -> assertThat(p.field()).endsWith(".date")));
        assertThat(store.events).isEmpty();
        assertThat(lock.held).isFalse();
    }

    @Test
    void onlyOnePublishAtATime() {
        lock.held = true;

        assertThatThrownBy(() -> publishing.publish(null, "admin")).isInstanceOf(PublishInProgressException.class);
        assertThat(store.events).isEmpty();
    }

    @Test
    void rollbackOnlyMovesThePointer() {
        news("open-day", "2026-10-01");
        Release first = publishing.publish("First", "admin");
        store.events.clear();

        publishing.restore(first.id(), "admin");

        assertThat(store.events).containsExactly("point " + first.id());
    }

    @Test
    void releasesInTheSameSecondGetDistinctIds() {
        news("open-day", "2026-10-01");

        Release first = publishing.publish(null, "admin");
        Release second = publishing.publish(null, "admin");

        assertThat(second.id()).isNotEqualTo(first.id()).startsWith(first.id());
    }

    public static class RecordingStore implements ReleaseStore {
        final List<String> events = new ArrayList<>();
        public Snapshot lastSnapshot;
        String current;

        @Override
        public void write(Release release, Snapshot snapshot) {
            events.add("write " + release.id());
            lastSnapshot = snapshot;
        }

        @Override
        public void pointTo(Release release) {
            events.add("point " + release.id());
            current = release.id();
        }

        @Override
        public Optional<String> currentReleaseId() {
            return Optional.ofNullable(current);
        }
    }

    public static class MemoryLog implements ReleaseLog {
        private final List<Release> releases = new ArrayList<>();

        @Override
        public void record(Release release) {
            releases.add(release);
        }

        @Override
        public List<Release> list() {
            return releases.stream().sorted(Comparator.comparing(Release::publishedAt).reversed()).toList();
        }

        @Override
        public Optional<Release> get(String id) {
            return releases.stream().filter(r -> r.id().equals(id)).findFirst();
        }
    }

    public static class SwitchLock implements PublishLock {
        boolean held;

        @Override
        public boolean tryAcquire(String owner) {
            if (held) {
                return false;
            }
            held = true;
            return true;
        }

        @Override
        public void release(String owner) {
            held = false;
        }
    }
}
