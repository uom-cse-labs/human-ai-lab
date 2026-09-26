package lk.ac.mrt.cse.hai.api.domain.publishing;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentRepository;
import lk.ac.mrt.cse.hai.api.domain.content.ContentStatus;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.content.VersionConflictException;
import lk.ac.mrt.cse.hai.api.domain.media.MediaAsset;
import lk.ac.mrt.cse.hai.api.domain.media.MediaRepository;
import lk.ac.mrt.cse.hai.api.domain.media.MediaStatus;
import lk.ac.mrt.cse.hai.api.domain.shared.NotFoundException;
import lk.ac.mrt.cse.hai.api.domain.shared.Page;

/**
 * Publish and roll back (technical design §3.5, SC-3, SC-4). A release is written in full first; the pointer
 * switch is one write, so visitors never see a half-published site.
 */
public class PublishService {

    private static final DateTimeFormatter RELEASE_ID =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH-mm-ss'Z'").withZone(ZoneOffset.UTC);

    private final ContentRepository contents;
    private final ReleaseStore store;
    private final ReleaseLog log;
    private final PublishLock lock;
    private final Clock clock;
    private final MediaRepository media;

    public PublishService(ContentRepository contents, ReleaseStore store, ReleaseLog log, PublishLock lock, Clock clock) {
        this(contents, store, log, lock, clock, null);
    }

    /** @param media when given, every photo an item uses must be processed and have alt text before publishing */
    public PublishService(ContentRepository contents, ReleaseStore store, ReleaseLog log, PublishLock lock, Clock clock,
            MediaRepository media) {
        this.contents = contents;
        this.store = store;
        this.log = log;
        this.lock = lock;
        this.clock = clock;
        this.media = media;
    }

    public Release publish(String note, String user) {
        return underLock(user, () -> {
            Snapshot snapshot = snapshot();
            validate(snapshot);
            Release release = new Release(nextReleaseId(), user, clock.instant(), note);
            store.write(release, snapshot);
            store.pointTo(release);
            log.record(release);
            markPublished(snapshot, user);
            return release;
        });
    }

    public Release restore(String releaseId, String user) {
        return underLock(user, () -> {
            Release release = log.get(releaseId).orElseThrow(() -> new NotFoundException("release " + releaseId));
            store.pointTo(release);
            return release;
        });
    }

    public Page<Release> list(String cursor, int limit) {
        return Page.of(log.list(), cursor, limit);
    }

    public String currentReleaseId() {
        return store.currentReleaseId().orElse(null);
    }

    private Snapshot snapshot() {
        Map<ContentType, List<ContentItem>> items = new EnumMap<>(ContentType.class);
        for (ContentType type : ContentType.values()) {
            items.put(type, contents.list(type).stream().filter(i -> i.status() != ContentStatus.UNPUBLISHED).toList());
        }
        return new Snapshot(items);
    }

    private void validate(Snapshot snapshot) {
        List<PublishValidationException.Problem> problems = new java.util.ArrayList<>(PublishRules.check(snapshot));
        if (media != null) {
            problems.addAll(mediaProblems(snapshot));
        }
        if (!problems.isEmpty()) {
            throw new PublishValidationException(problems);
        }
    }

    private List<PublishValidationException.Problem> mediaProblems(Snapshot snapshot) {
        List<PublishValidationException.Problem> problems = new java.util.ArrayList<>();
        for (List<ContentItem> items : snapshot.items().values()) {
            for (ContentItem item : items) {
                for (String ref : item.mediaRefs()) {
                    String field = item.type().key() + "/" + item.id() + ".media";
                    MediaAsset asset = media.get(ref).orElse(null);
                    if (asset == null) {
                        problems.add(new PublishValidationException.Problem(field, "\"" + item.title() + "\" uses a photo that was deleted. Choose another."));
                    } else if (asset.status() != MediaStatus.READY) {
                        problems.add(new PublishValidationException.Problem(field, "\"" + item.title() + "\" uses a photo that isn't ready (" + asset.status().name().toLowerCase() + ")."));
                    } else if (asset.altText() == null || asset.altText().isBlank()) {
                        problems.add(new PublishValidationException.Problem(field, "\"" + item.title() + "\" uses the photo \"" + asset.fileName() + "\", which needs alt text. Add it in the media library."));
                    }
                }
            }
        }
        return problems;
    }

    private void markPublished(Snapshot snapshot, String user) {
        for (List<ContentItem> items : snapshot.items().values()) {
            for (ContentItem item : items) {
                if (item.status() == ContentStatus.PUBLISHED && Integer.valueOf(item.version()).equals(item.publishedVersion())) {
                    continue;
                }
                try {
                    contents.save(new ContentItem(item.id(), item.type(), item.slug(), item.title(), item.summary(), item.body(),
                            item.fields(), item.mediaRefs(), ContentStatus.PUBLISHED, item.version(), item.version(),
                            item.updatedBy(), item.updatedAt()), item.version());
                } catch (VersionConflictException edited) {
                    // Saved again while publishing: the release has the earlier version, and the item correctly
                    // keeps showing unpublished changes.
                }
            }
        }
    }

    private String nextReleaseId() {
        Instant now = clock.instant();
        String id = RELEASE_ID.format(now);
        int n = 1;
        String candidate = id;
        while (log.get(candidate).isPresent()) {
            candidate = id + "-" + (++n);
        }
        return candidate;
    }

    private <T> T underLock(String user, java.util.function.Supplier<T> work) {
        if (!lock.tryAcquire(user)) {
            throw new PublishInProgressException();
        }
        try {
            return work.get();
        } finally {
            lock.release(user);
        }
    }
}
