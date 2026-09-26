package lk.ac.mrt.cse.hai.api.domain.content;

import java.time.Clock;
import java.util.UUID;
import lk.ac.mrt.cse.hai.api.domain.shared.NotFoundException;
import lk.ac.mrt.cse.hai.api.domain.shared.Page;

/** Drafting use cases (technical design §4.5, §5.4). Role checks happen at the API edge. */
public class ContentService {

    private final ContentRepository repository;
    private final Clock clock;

    public ContentService(ContentRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public Page<ContentItem> list(ContentType type, String cursor, int limit) {
        return Page.of(repository.list(type), cursor, limit);
    }

    public ContentItem get(ContentType type, String id) {
        return repository.get(type, id).orElseThrow(() -> new NotFoundException(type.key() + " " + id));
    }

    public ContentItem create(ContentType type, ContentDraft draft, String user) {
        requireFreeSlug(type, draft.slug(), null);
        ContentItem item = new ContentItem(newId(type), type, draft.slug(), draft.title(), draft.summary(), draft.body(),
                draft.fields(), draft.mediaRefs(), ContentStatus.DRAFT, 1, null, user, clock.instant());
        repository.save(item, 0);
        return item;
    }

    public ContentItem update(ContentType type, String id, ContentDraft draft, int expectedVersion, String user) {
        ContentItem current = get(type, id);
        if (current.version() != expectedVersion) {
            throw new VersionConflictException(current);
        }
        requireFreeSlug(type, draft.slug(), id);
        ContentItem updated = current.edited(draft, user, clock.instant());
        repository.save(updated, expectedVersion);
        return updated;
    }

    /** Hides the item from the next release. Admins only. */
    public ContentItem unpublish(ContentType type, String id, String user) {
        ContentItem current = get(type, id);
        ContentItem updated = current.withStatus(ContentStatus.UNPUBLISHED, current.publishedVersion(), user, clock.instant());
        repository.save(updated, current.version());
        return updated;
    }

    /** Deletes an item that visitors can't see: a draft or an unpublished item. Admins only. */
    public void delete(ContentType type, String id) {
        ContentItem current = get(type, id);
        if (current.status() == ContentStatus.PUBLISHED) {
            throw new ContentRuleException("INVALID_STATE", "Unpublish this item and publish the site before deleting it.");
        }
        repository.delete(type, id);
    }

    private void requireFreeSlug(ContentType type, String slug, String ownId) {
        repository.findBySlug(type, slug)
                .filter(existing -> !existing.id().equals(ownId))
                .ifPresent(existing -> {
                    throw new ContentRuleException("SLUG_TAKEN", "Another " + type.key() + " already uses the address \"" + slug + "\".");
                });
    }

    private static String newId(ContentType type) {
        return type.key().charAt(0) + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}
