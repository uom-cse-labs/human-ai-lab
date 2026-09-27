package lk.ac.mrt.cse.hai.api.adapters.r2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class R2MirrorTest {

    private final Path dataDir = Path.of("/data");
    private final R2Mirror mirror = new R2Mirror(null, "hai-content", dataDir);

    @Test
    void bucketKeysMirrorTheDataFolderLayout() {
        assertThat(mirror.key(dataDir.resolve("content/current.json"))).isEqualTo("content/current.json");
        assertThat(mirror.key(dataDir.resolve("media/m_1/photo-800.webp"))).isEqualTo("media/m_1/photo-800.webp");
        assertThat(mirror.key(dataDir.resolve("items/news/../news/n_1.json"))).isEqualTo("items/news/n_1.json");
    }

    @Test
    void refusesFilesOutsideTheDataFolder() {
        assertThatThrownBy(() -> mirror.key(Path.of("/etc/passwd"))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> mirror.key(dataDir)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void contentTypesMatchWhatTheSiteWorkerServes() {
        assertThat(R2Mirror.contentType("content/current.json")).isEqualTo("application/json");
        assertThat(R2Mirror.contentType("media/m_1/a.webp")).isEqualTo("image/webp");
        assertThat(R2Mirror.contentType("media/m_1/a.jpg")).isEqualTo("image/jpeg");
    }
}
