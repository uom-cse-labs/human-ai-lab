package lk.ac.mrt.cse.hai.api.domain.content;

import java.util.List;
import java.util.Map;

/** What an editor submits when creating or saving an item. */
public record ContentDraft(
        String slug, String title, String summary, String body, Map<String, Object> fields, List<String> mediaRefs) {

    public ContentDraft {
        fields = fields == null ? Map.of() : Map.copyOf(fields);
        mediaRefs = mediaRefs == null ? List.of() : List.copyOf(mediaRefs);
    }
}
