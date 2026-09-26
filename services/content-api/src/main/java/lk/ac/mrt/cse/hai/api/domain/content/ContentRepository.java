package lk.ac.mrt.cse.hai.api.domain.content;

import java.util.List;
import java.util.Optional;

/** Port for storing content items (DynamoDB in AWS, files locally). */
public interface ContentRepository {

    /** Items of a type, newest first by update time. */
    List<ContentItem> list(ContentType type);

    Optional<ContentItem> get(ContentType type, String id);

    Optional<ContentItem> findBySlug(ContentType type, String slug);

    /**
     * Stores {@code item} only if the stored version still equals {@code expectedVersion}
     * (0 for a new item).
     *
     * @throws VersionConflictException if someone saved in between
     */
    void save(ContentItem item, int expectedVersion);

    void delete(ContentType type, String id);
}
