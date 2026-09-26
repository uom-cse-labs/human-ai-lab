package lk.ac.mrt.cse.hai.api.config;

import java.nio.file.Path;
import lk.ac.mrt.cse.hai.api.adapters.file.FileContentRepository;
import lk.ac.mrt.cse.hai.api.adapters.file.FileReleaseLog;
import lk.ac.mrt.cse.hai.api.adapters.file.FileReleaseStore;
import lk.ac.mrt.cse.hai.api.adapters.lock.InProcessPublishLock;
import lk.ac.mrt.cse.hai.api.domain.content.ContentRepository;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishLock;
import lk.ac.mrt.cse.hai.api.domain.publishing.ReleaseLog;
import lk.ac.mrt.cse.hai.api.domain.publishing.ReleaseStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;

/** {@code hai.storage=local}: everything in a folder, for development without AWS. */
@Configuration
@ConditionalOnProperty(prefix = "hai", name = "storage", havingValue = "local")
public class LocalStorageConfig {

    private final Path dataDir;

    public LocalStorageConfig(@Value("${hai.local.data-dir}") String dataDir) {
        this.dataDir = Path.of(dataDir).toAbsolutePath().normalize();
    }

    @Bean
    ContentRepository contentRepository(ObjectMapper json) {
        return new FileContentRepository(dataDir, json);
    }

    @Bean
    ReleaseStore releaseStore(ObjectMapper json) {
        return new FileReleaseStore(dataDir, json);
    }

    @Bean
    ReleaseLog releaseLog(ObjectMapper json) {
        return new FileReleaseLog(dataDir, json);
    }

    @Bean
    PublishLock publishLock() {
        return new InProcessPublishLock();
    }
}
