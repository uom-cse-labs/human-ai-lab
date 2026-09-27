package lk.ac.mrt.cse.hai.api.config;

import java.nio.file.Path;
import lk.ac.mrt.cse.hai.api.adapters.file.FileContentRepository;
import lk.ac.mrt.cse.hai.api.adapters.file.FileReleaseLog;
import lk.ac.mrt.cse.hai.api.adapters.file.FileReleaseStore;
import lk.ac.mrt.cse.hai.api.adapters.file.FileMediaLibrary;
import lk.ac.mrt.cse.hai.api.adapters.file.FileMediaRepository;
import lk.ac.mrt.cse.hai.api.adapters.file.FileMirror;
import lk.ac.mrt.cse.hai.api.adapters.file.FileUploadInbox;
import lk.ac.mrt.cse.hai.api.adapters.image.JavaImageProcessor;
import lk.ac.mrt.cse.hai.api.adapters.lock.InProcessPublishLock;
import lk.ac.mrt.cse.hai.api.domain.media.ImageProcessor;
import lk.ac.mrt.cse.hai.api.domain.media.MediaLibrary;
import lk.ac.mrt.cse.hai.api.domain.media.MediaRepository;
import lk.ac.mrt.cse.hai.api.domain.content.ContentRepository;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishLock;
import lk.ac.mrt.cse.hai.api.domain.publishing.ReleaseLog;
import lk.ac.mrt.cse.hai.api.domain.publishing.ReleaseStore;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;

/**
 * Everything in a data folder ({@code hai.data-dir}):
 * <ul>
 *   <li>{@code hai.storage=local}: the folder is the store, for development.</li>
 *   <li>{@code hai.storage=r2}: on Cloudflare, the folder is a working copy and every write is also sent to R2
 *       by the {@link FileMirror} from {@link R2StorageConfig}.</li>
 * </ul>
 */
@Configuration
@ConditionalOnExpression("'${hai.storage:}' == 'local' or '${hai.storage:}' == 'r2'")
public class FileStorageConfig {

    private final Path dataDir;
    private final FileMirror mirror;

    public FileStorageConfig(@Value("${hai.data-dir}") String dataDir, ObjectProvider<FileMirror> mirror) {
        this.dataDir = Path.of(dataDir).toAbsolutePath().normalize();
        this.mirror = mirror.getIfAvailable(() -> FileMirror.NONE);
    }

    @Bean
    ContentRepository contentRepository(ObjectMapper json) {
        return new FileContentRepository(dataDir, json, mirror);
    }

    @Bean
    ReleaseStore releaseStore(ObjectMapper json) {
        return new FileReleaseStore(dataDir, json, mirror);
    }

    @Bean
    ReleaseLog releaseLog(ObjectMapper json) {
        return new FileReleaseLog(dataDir, json, mirror);
    }

    @Bean
    PublishLock publishLock() {
        return new InProcessPublishLock();
    }

    @Bean
    MediaRepository mediaRepository(ObjectMapper json) {
        return new FileMediaRepository(dataDir, json, mirror);
    }

    @Bean
    FileUploadInbox uploadInbox(java.time.Clock clock) {
        return new FileUploadInbox(dataDir, clock);
    }

    @Bean
    MediaLibrary mediaLibrary() {
        return new FileMediaLibrary(dataDir, mirror);
    }

    /** Uploads are processed as soon as they complete, in the API itself. */
    @Bean
    ImageProcessor imageProcessor() {
        return new JavaImageProcessor();
    }
}
