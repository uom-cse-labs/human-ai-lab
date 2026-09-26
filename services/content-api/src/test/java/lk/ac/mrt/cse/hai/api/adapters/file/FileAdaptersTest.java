package lk.ac.mrt.cse.hai.api.adapters.file;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentStatus;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.content.VersionConflictException;
import lk.ac.mrt.cse.hai.api.domain.publishing.Release;
import lk.ac.mrt.cse.hai.api.domain.publishing.Snapshot;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

class FileAdaptersTest {

    @TempDir
    Path dataDir;

    private final ObjectMapper json = JsonMapper.builder().build();

    private static ContentItem item(int version) {
        return new ContentItem("n_1", ContentType.NEWS, "open-day", "Open day", "Summary", "Body",
                Map.of("date", "2026-10-01", "imageUrl", "https://example.org/a.jpg"), List.of(),
                ContentStatus.DRAFT, version, null, "asha", Instant.parse("2026-10-01T10:00:00Z"));
    }

    @Test
    void contentRepositoryRoundTripsAndEnforcesVersions() {
        FileContentRepository repository = new FileContentRepository(dataDir, json);
        repository.save(item(1), 0);
        repository.save(item(2), 1);

        assertThat(repository.get(ContentType.NEWS, "n_1")).contains(item(2));
        assertThat(repository.findBySlug(ContentType.NEWS, "open-day")).isPresent();
        assertThatThrownBy(() -> repository.save(item(3), 1)).isInstanceOf(VersionConflictException.class);
    }

    @Test
    void releaseFilesFollowTheContract() throws Exception {
        FileReleaseStore store = new FileReleaseStore(dataDir, json);
        Release release = new Release("2026-10-02T09-15-00Z", "admin", Instant.parse("2026-10-02T09:15:00Z"), null);

        store.write(release, new Snapshot(Map.of(ContentType.NEWS, List.of(item(1)))));
        assertThat(store.currentReleaseId()).isEmpty();
        store.pointTo(release);

        JsonNode pointer = json.readTree(Files.readString(dataDir.resolve("content/current.json")));
        assertThat(pointer.path("schema").asInt()).isEqualTo(1);
        assertThat(pointer.path("release").asText()).isEqualTo(release.id());

        JsonNode news = json.readTree(Files.readString(dataDir.resolve("content/releases/" + release.id() + "/news.json")));
        JsonNode first = news.path("items").get(0);
        assertThat(first.path("slug").asText()).isEqualTo("open-day");
        assertThat(first.path("date").asText()).isEqualTo("2026-10-01");
        assertThat(first.path("cover").path("src").asText()).isEqualTo("https://example.org/a.jpg");
        assertThat(store.currentReleaseId()).contains(release.id());
    }

    @Test
    void releaseLogListsNewestFirst() {
        FileReleaseLog log = new FileReleaseLog(dataDir, json);
        Release older = new Release("a", "admin", Instant.parse("2026-10-01T00:00:00Z"), null);
        Release newer = new Release("b", "admin", Instant.parse("2026-10-02T00:00:00Z"), "note");
        log.record(older);
        log.record(newer);

        assertThat(log.list()).containsExactly(newer, older);
        assertThat(log.get("a")).contains(older);
    }
}
