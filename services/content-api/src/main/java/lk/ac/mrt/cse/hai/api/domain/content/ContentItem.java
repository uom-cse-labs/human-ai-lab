package lk.ac.mrt.cse.hai.api.domain.content;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * An editable piece of content (technical design §4.2). {@code version} increases on every save and is
 * used for optimistic locking; {@code publishedVersion} is the version captured by the latest release.
 */
public record ContentItem(
        String id,
        ContentType type,
        String slug,
        String title,
        String summary,
        String body,
        Map<String, Object> fields,
        List<String> mediaRefs,
        ContentStatus status,
        int version,
        Integer publishedVersion,
        String updatedBy,
        Instant updatedAt) {

    public ContentItem {
        fields = fields == null ? Map.of() : Map.copyOf(fields);
        mediaRefs = mediaRefs == null ? List.of() : List.copyOf(mediaRefs);
    }

    ContentItem edited(ContentDraft draft, String user, Instant at) {
        return new ContentItem(id, type, draft.slug(), draft.title(), draft.summary(), draft.body(), draft.fields(),
                draft.mediaRefs(), status == ContentStatus.UNPUBLISHED ? ContentStatus.UNPUBLISHED : status,
                version + 1, publishedVersion, user, at);
    }

    ContentItem withStatus(ContentStatus newStatus, Integer newPublishedVersion, String user, Instant at) {
        return new ContentItem(id, type, slug, title, summary, body, fields, mediaRefs, newStatus,
                version + 1, newPublishedVersion, user, at);
    }

    /** True when the item has edits that visitors can't see yet. */
    public boolean hasUnpublishedChanges() {
        return status != ContentStatus.UNPUBLISHED && (publishedVersion == null || publishedVersion < version);
    }
}
