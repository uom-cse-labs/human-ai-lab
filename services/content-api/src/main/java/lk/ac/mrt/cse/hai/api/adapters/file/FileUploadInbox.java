package lk.ac.mrt.cse.hai.api.adapters.file;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Clock;
import java.time.Duration;
import java.util.Comparator;
import java.util.stream.Stream;
import lk.ac.mrt.cse.hai.api.domain.media.UploadInbox;

/**
 * Local development: stands in for the S3 uploads bucket. Instead of a presigned S3 URL, the browser gets a
 * local upload URL served by the API's {@code local} profile; originals are kept under {@code <dataDir>/uploads/}.
 */
public class FileUploadInbox implements UploadInbox {

    private final Path dir;
    private final Clock clock;

    public FileUploadInbox(Path dataDir, Clock clock) {
        this.dir = dataDir.resolve("uploads");
        this.clock = clock;
    }

    @Override
    public UploadTarget createTarget(String mediaId, String contentType, long sizeBytes) {
        return new UploadTarget("/api/media/" + SafeIds.check(mediaId) + "/local-upload", "local-" + mediaId,
                clock.instant().plus(Duration.ofMinutes(15)));
    }

    /** Stores the uploaded bytes, refusing more than {@code maxBytes}. */
    public void write(String mediaId, InputStream body, long maxBytes) {
        Path target = original(mediaId);
        try {
            Files.createDirectories(target.getParent());
            Path tmp = Files.createTempFile(target.getParent(), ".tmp-", "");
            try (InputStream limited = body) {
                long copied = Files.copy(new LimitedInputStream(limited, maxBytes + 1), tmp, StandardCopyOption.REPLACE_EXISTING);
                if (copied > maxBytes) {
                    Files.deleteIfExists(tmp);
                    throw new IllegalArgumentException("The file is larger than announced");
                }
            }
            Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public byte[] read(String mediaId) {
        Path file = original(mediaId);
        try {
            return Files.exists(file) ? Files.readAllBytes(file) : null;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public void delete(String mediaId) {
        deleteTree(dir.resolve(SafeIds.check(mediaId)));
    }

    private Path original(String mediaId) {
        return dir.resolve(SafeIds.check(mediaId)).resolve("original");
    }

    static void deleteTree(Path root) {
        if (!Files.exists(root)) {
            return;
        }
        try (Stream<Path> paths = Files.walk(root)) {
            for (Path p : paths.sorted(Comparator.reverseOrder()).toList()) {
                Files.deleteIfExists(p);
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Stops reading after {@code limit} bytes. */
    private static final class LimitedInputStream extends InputStream {
        private final InputStream in;
        private long remaining;

        LimitedInputStream(InputStream in, long limit) {
            this.in = in;
            this.remaining = limit;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) {
                return -1;
            }
            int b = in.read();
            if (b >= 0) {
                remaining--;
            }
            return b;
        }

        @Override
        public int read(byte[] buffer, int offset, int length) throws IOException {
            if (remaining <= 0) {
                return -1;
            }
            int n = in.read(buffer, offset, (int) Math.min(length, remaining));
            if (n > 0) {
                remaining -= n;
            }
            return n;
        }
    }
}
