package lk.ac.mrt.cse.hai.api.domain.publishing;

import java.util.List;
import java.util.Map;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;

/** Everything visitors will see in one release, by content type. */
public record Snapshot(Map<ContentType, List<ContentItem>> items) {

    public List<ContentItem> of(ContentType type) {
        return items.getOrDefault(type, List.of());
    }
}
