package lk.ac.mrt.cse.hai.api.adapters.file;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import lk.ac.mrt.cse.hai.api.domain.media.MediaAsset;
import lk.ac.mrt.cse.hai.api.domain.media.MediaRepository;
import tools.jackson.databind.ObjectMapper;

/** Local development: one JSON file per media record under {@code <dataDir>/media-records/}. */
public class FileMediaRepository implements MediaRepository {

    private final Path dir;
    private final ObjectMapper json;
    private final FileMirror mirror;

    public FileMediaRepository(Path dataDir, ObjectMapper json) {
        this(dataDir, json, FileMirror.NONE);
    }

    public FileMediaRepository(Path dataDir, ObjectMapper json, FileMirror mirror) {
        this.dir = dataDir.resolve("media-records");
        this.json = json;
        this.mirror = mirror;
    }

    @Override
    public synchronized void save(MediaAsset asset) {
        JsonFiles.write(json, file(asset.id()), asset);
        mirror.put(file(asset.id()));
    }

    @Override
    public synchronized Optional<MediaAsset> get(String id) {
        Path file = file(id);
        return Files.exists(file) ? Optional.of(json.readValue(file.toFile(), MediaAsset.class)) : Optional.empty();
    }

    @Override
    public synchronized List<MediaAsset> list() {
        if (!Files.isDirectory(dir)) {
            return List.of();
        }
        try (Stream<Path> files = Files.list(dir)) {
            return files.filter(f -> f.getFileName().toString().endsWith(".json") && !f.getFileName().toString().startsWith("."))
                    .map(f -> json.readValue(f.toFile(), MediaAsset.class))
                    .sorted(Comparator.comparing(MediaAsset::createdAt).reversed())
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public synchronized void delete(String id) {
        try {
            Files.deleteIfExists(file(id));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        mirror.delete(file(id));
    }

    private Path file(String id) {
        return dir.resolve(SafeIds.check(id) + ".json");
    }
}
