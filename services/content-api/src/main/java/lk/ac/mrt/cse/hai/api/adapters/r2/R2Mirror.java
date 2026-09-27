package lk.ac.mrt.cse.hai.api.adapters.r2;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import lk.ac.mrt.cse.hai.api.adapters.file.FileMirror;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.S3Object;

/**
 * Keeps the API's data folder in an R2 bucket, under the same paths: {@code items/}, {@code media-records/},
 * {@code releases.json}, and the public {@code content/} and {@code media/} files the site Worker serves.
 *
 * <p>The container's disk is wiped whenever it sleeps, so {@link #restore()} downloads the working set on start
 * and every write is sent to R2 before the request returns. This is only safe with a single API instance
 * ({@code max_instances: 1}), which also keeps the in-process publish lock correct.
 */
public class R2Mirror implements FileMirror {

    private static final Logger log = LoggerFactory.getLogger(R2Mirror.class);

    /** What the API reads back from disk. Release files and photos are write-only here, so they stay in R2. */
    private static final List<String> RESTORED_PREFIXES = List.of("items/", "media-records/");
    private static final List<String> RESTORED_FILES = List.of("releases.json", "content/current.json");

    private final S3Client s3;
    private final String bucket;
    private final Path dataDir;

    public R2Mirror(S3Client s3, String bucket, Path dataDir) {
        this.s3 = s3;
        this.bucket = bucket;
        this.dataDir = dataDir.toAbsolutePath().normalize();
    }

    /** Downloads everything the API reads into the (empty) data folder. */
    public void restore() {
        int count = 0;
        for (String prefix : RESTORED_PREFIXES) {
            for (String key : keys(prefix)) {
                count += download(key) ? 1 : 0;
            }
        }
        for (String key : RESTORED_FILES) {
            count += download(key) ? 1 : 0;
        }
        log.info("Restored {} files from R2 bucket {}", count, bucket);
    }

    @Override
    public void put(Path file) {
        String key = key(file);
        s3.putObject(r -> r.bucket(bucket).key(key).contentType(contentType(key)), RequestBody.fromFile(file));
    }

    @Override
    public void delete(Path file) {
        String key = key(file);
        s3.deleteObject(r -> r.bucket(bucket).key(key));
    }

    @Override
    public void deleteTree(Path dir) {
        List<ObjectIdentifier> objects = keys(key(dir) + "/").stream()
                .map(k -> ObjectIdentifier.builder().key(k).build())
                .toList();
        // DeleteObjects takes at most 1,000 keys per call.
        for (int i = 0; i < objects.size(); i += 1000) {
            List<ObjectIdentifier> batch = objects.subList(i, Math.min(i + 1000, objects.size()));
            s3.deleteObjects(r -> r.bucket(bucket).delete(d -> d.objects(batch).quiet(true)));
        }
    }

    /** Bucket key for a file in the data folder, e.g. {@code content/current.json}. */
    String key(Path file) {
        Path relative = dataDir.relativize(file.toAbsolutePath().normalize());
        if (relative.startsWith("..") || relative.toString().isEmpty()) {
            throw new IllegalArgumentException("Not in the data folder: " + file);
        }
        return relative.toString().replace('\\', '/');
    }

    static String contentType(String key) {
        if (key.endsWith(".json")) {
            return "application/json";
        }
        if (key.endsWith(".webp")) {
            return "image/webp";
        }
        if (key.endsWith(".png")) {
            return "image/png";
        }
        if (key.endsWith(".jpg") || key.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        return "application/octet-stream";
    }

    private List<String> keys(String prefix) {
        List<String> keys = new ArrayList<>();
        s3.listObjectsV2Paginator(r -> r.bucket(bucket).prefix(prefix)).contents().stream()
                .map(S3Object::key)
                .forEach(keys::add);
        return keys;
    }

    private boolean download(String key) {
        Path target = dataDir.resolve(key).normalize();
        if (!target.startsWith(dataDir)) {
            throw new IllegalStateException("Unexpected key in bucket: " + key);
        }
        try {
            Files.createDirectories(target.getParent());
            Files.deleteIfExists(target);
            s3.getObject(r -> r.bucket(bucket).key(key), ResponseTransformer.toFile(target));
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
