package lk.ac.mrt.cse.hai.api.adapters.file;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.ZoneOffset;
import java.util.Optional;
import lk.ac.mrt.cse.hai.api.adapters.release.ReleaseFiles;
import lk.ac.mrt.cse.hai.api.contract.model.ReleasePointer;
import lk.ac.mrt.cse.hai.api.domain.publishing.Release;
import lk.ac.mrt.cse.hai.api.domain.publishing.ReleaseStore;
import lk.ac.mrt.cse.hai.api.domain.publishing.Snapshot;
import tools.jackson.databind.ObjectMapper;

/**
 * Local development: writes release files to {@code <dataDir>/content/}, laid out exactly as in the
 * S3 content bucket: {@code current.json} and {@code releases/<id>/*.json}.
 */
public class FileReleaseStore implements ReleaseStore {

    private final Path contentDir;
    private final ObjectMapper json;
    private final FileMirror mirror;

    public FileReleaseStore(Path dataDir, ObjectMapper json) {
        this(dataDir, json, FileMirror.NONE);
    }

    public FileReleaseStore(Path dataDir, ObjectMapper json, FileMirror mirror) {
        this.contentDir = dataDir.resolve("content");
        this.json = ReleaseFiles.writer(json);
        this.mirror = mirror;
    }

    @Override
    public void write(Release release, Snapshot snapshot) {
        Path dir = contentDir.resolve("releases").resolve(release.id());
        ReleaseFiles.of(snapshot).forEach((name, content) -> {
            JsonFiles.write(json, dir.resolve(name), content);
            mirror.put(dir.resolve(name));
        });
    }

    @Override
    public synchronized void pointTo(Release release) {
        Path pointer = contentDir.resolve("current.json");
        JsonFiles.write(json, pointer, new ReleasePointer()
                .schema(ReleasePointer.SchemaEnum.NUMBER_1)
                .release(release.id())
                .publishedAt(release.publishedAt().atOffset(ZoneOffset.UTC)));
        // Written after every release file, so visitors never see a pointer to a half-written release.
        mirror.put(pointer);
    }

    @Override
    public synchronized Optional<String> currentReleaseId() {
        Path pointer = contentDir.resolve("current.json");
        if (!Files.exists(pointer)) {
            return Optional.empty();
        }
        return Optional.of(json.readValue(pointer.toFile(), ReleasePointer.class).getRelease());
    }
}
