package lk.ac.mrt.cse.hai.api.domain.content;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Test double with the same optimistic-locking contract as the real adapters. */
public class InMemoryContentRepository implements ContentRepository {

    private final Map<String, ContentItem> items = new LinkedHashMap<>();

    @Override
    public List<ContentItem> list(ContentType type) {
        return items.values().stream().filter(i -> i.type() == type)
                .sorted(Comparator.comparing(ContentItem::updatedAt).reversed()).toList();
    }

    @Override
    public Optional<ContentItem> get(ContentType type, String id) {
        return Optional.ofNullable(items.get(id)).filter(i -> i.type() == type);
    }

    @Override
    public Optional<ContentItem> findBySlug(ContentType type, String slug) {
        return list(type).stream().filter(i -> i.slug().equals(slug)).findFirst();
    }

    @Override
    public void save(ContentItem item, int expectedVersion) {
        ContentItem stored = items.get(item.id());
        if ((stored == null ? 0 : stored.version()) != expectedVersion) {
            throw new VersionConflictException(stored);
        }
        items.put(item.id(), item);
    }

    @Override
    public void delete(ContentType type, String id) {
        items.remove(id);
    }
}
