package lk.ac.mrt.cse.hai.api.adapters.file;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lk.ac.mrt.cse.hai.api.domain.publishing.Release;
import lk.ac.mrt.cse.hai.api.domain.publishing.ReleaseLog;
import tools.jackson.databind.ObjectMapper;

/** Local development: release history in {@code <dataDir>/releases.json}. */
public class FileReleaseLog implements ReleaseLog {

    private final Path file;
    private final ObjectMapper json;

    public FileReleaseLog(Path dataDir, ObjectMapper json) {
        this.file = dataDir.resolve("releases.json");
        this.json = json;
    }

    @Override
    public synchronized void record(Release release) {
        List<Release> all = new ArrayList<>(list());
        all.add(release);
        JsonFiles.write(json, file, all);
    }

    @Override
    public synchronized List<Release> list() {
        if (!Files.exists(file)) {
            return List.of();
        }
        return Arrays.stream(json.readValue(file.toFile(), Release[].class))
                .sorted(Comparator.comparing(Release::publishedAt).reversed())
                .toList();
    }

    @Override
    public synchronized Optional<Release> get(String id) {
        return list().stream().filter(r -> r.id().equals(id)).findFirst();
    }
}
