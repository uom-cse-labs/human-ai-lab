package lk.ac.mrt.cse.hai.api.web;

import java.time.ZoneOffset;
import lk.ac.mrt.cse.hai.api.contract.model.ContentItemInput;
import lk.ac.mrt.cse.hai.api.contract.model.ContentStatus;
import lk.ac.mrt.cse.hai.api.domain.content.ContentDraft;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.publishing.Release;

/** Converts between contract DTOs and domain objects. */
final class ContentMapper {

    private ContentMapper() {}

    static ContentType type(lk.ac.mrt.cse.hai.api.contract.model.ContentType type) {
        return ContentType.fromKey(type.getValue());
    }

    static ContentDraft draft(ContentItemInput input) {
        return new ContentDraft(input.getSlug(), input.getTitle(), input.getSummary(), input.getBody(),
                input.getFields(), input.getMediaRefs());
    }

    static lk.ac.mrt.cse.hai.api.contract.model.ContentItem dto(ContentItem item) {
        return new lk.ac.mrt.cse.hai.api.contract.model.ContentItem()
                .id(item.id())
                .type(lk.ac.mrt.cse.hai.api.contract.model.ContentType.fromValue(item.type().key()))
                .slug(item.slug())
                .title(item.title())
                .summary(item.summary())
                .body(item.body())
                .fields(new java.util.HashMap<>(item.fields()))
                .mediaRefs(new java.util.ArrayList<>(item.mediaRefs()))
                .status(ContentStatus.fromValue(item.status().name().toLowerCase()))
                .version(item.version())
                .publishedVersion(item.publishedVersion())
                .updatedBy(item.updatedBy())
                .updatedAt(item.updatedAt().atOffset(ZoneOffset.UTC));
    }

    static lk.ac.mrt.cse.hai.api.contract.model.Release dto(Release release, String currentId) {
        return new lk.ac.mrt.cse.hai.api.contract.model.Release()
                .id(release.id())
                .publishedBy(release.publishedBy())
                .publishedAt(release.publishedAt().atOffset(ZoneOffset.UTC))
                .note(release.note())
                .isCurrent(release.id().equals(currentId));
    }
}
