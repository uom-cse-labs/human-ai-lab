package lk.ac.mrt.cse.hai.api.adapters.file;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentRepository;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.content.VersionConflictException;
import tools.jackson.databind.ObjectMapper;

/** Local development: one JSON file per item under {@code <dataDir>/items/<type>/}. */
public class FileContentRepository implements ContentRepository {

    private final Path root;
    private final ObjectMapper json;

    public FileContentRepository(Path dataDir, ObjectMapper json) {
        this.root = dataDir.resolve("items");
        this.json = json;
    }

    @Override
    public synchronized List<ContentItem> list(ContentType type) {
        Path dir = root.resolve(type.key());
        if (!Files.isDirectory(dir)) {
            return List.of();
        }
        try (Stream<Path> files = Files.list(dir)) {
            return files.filter(f -> f.getFileName().toString().endsWith(".json") && !f.getFileName().toString().startsWith("."))
                    .map(f -> json.readValue(f.toFile(), ContentItem.class))
                    .sorted(Comparator.comparing(ContentItem::updatedAt).reversed())
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public synchronized Optional<ContentItem> get(ContentType type, String id) {
        Path file = file(type, id);
        return Files.exists(file) ? Optional.of(json.readValue(file.toFile(), ContentItem.class)) : Optional.empty();
    }

    @Override
    public synchronized Optional<ContentItem> findBySlug(ContentType type, String slug) {
        return list(type).stream().filter(i -> i.slug().equals(slug)).findFirst();
    }

    @Override
    public synchronized void save(ContentItem item, int expectedVersion) {
        int stored = get(item.type(), item.id()).map(ContentItem::version).orElse(0);
        if (stored != expectedVersion) {
            throw new VersionConflictException(get(item.type(), item.id()).orElseThrow());
        }
        JsonFiles.write(json, file(item.type(), item.id()), item);
    }

    @Override
    public synchronized void delete(ContentType type, String id) {
        try {
            Files.deleteIfExists(file(type, id));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private Path file(ContentType type, String id) {
        if (!id.matches("[A-Za-z0-9_-]+")) {
            throw new IllegalArgumentException("Invalid id");
        }
        return root.resolve(type.key()).resolve(id + ".json");
    }
}
