package lk.ac.mrt.cse.hai.api.config;

import java.time.Clock;
import lk.ac.mrt.cse.hai.api.domain.content.ContentRepository;
import lk.ac.mrt.cse.hai.api.domain.content.ContentService;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishLock;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishService;
import lk.ac.mrt.cse.hai.api.domain.publishing.ReleaseLog;
import lk.ac.mrt.cse.hai.api.domain.publishing.ReleaseStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Content and publishing use cases. Enabled when a storage backend is configured ({@code hai.storage});
 * until the DynamoDB/S3 adapters land, only {@code local} exists, so AWS deployments serve the contact form only.
 */
@Configuration
@ConditionalOnProperty(prefix = "hai", name = "storage")
public class ContentConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    ContentService contentService(ContentRepository repository, Clock clock) {
        return new ContentService(repository, clock);
    }

    @Bean
    PublishService publishService(ContentRepository contents, ReleaseStore store, ReleaseLog log, PublishLock lock, Clock clock) {
        return new PublishService(contents, store, log, lock, clock);
    }
}
