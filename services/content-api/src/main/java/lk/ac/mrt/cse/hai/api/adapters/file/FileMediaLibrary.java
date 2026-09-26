package lk.ac.mrt.cse.hai.api.adapters.file;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import lk.ac.mrt.cse.hai.api.domain.media.MediaLibrary;

/** Local development: stands in for the S3 media bucket; files under {@code <dataDir>/media/} are served at /media. */
public class FileMediaLibrary implements MediaLibrary {

    private final Path dir;

    public FileMediaLibrary(Path dataDir) {
        this.dir = dataDir.resolve("media");
    }

    @Override
    public String put(String mediaId, String fileName, byte[] data, String contentType) {
        if (!fileName.matches("[a-z0-9-]+\\.(jpg|png|webp)")) {
            throw new IllegalArgumentException("Invalid rendition name");
        }
        Path target = dir.resolve(SafeIds.check(mediaId)).resolve(fileName);
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, data);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return "/media/" + mediaId + "/" + fileName;
    }

    @Override
    public void delete(String mediaId) {
        FileUploadInbox.deleteTree(dir.resolve(SafeIds.check(mediaId)));
    }
}
