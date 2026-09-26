package lk.ac.mrt.cse.hai.api.local;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Local development only: serves published release files at /content/*, as CloudFront does from S3. */
@Configuration
@Profile("local")
public class LocalContentFiles implements WebMvcConfigurer {

    private final Path contentDir;

    public LocalContentFiles(@Value("${hai.local.data-dir}") String dataDir) {
        this.contentDir = Path.of(dataDir).toAbsolutePath().normalize().resolve("content");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/content/**")
                .addResourceLocations(contentDir.toUri().toString())
                .setCacheControl(CacheControl.noCache());
    }
}
