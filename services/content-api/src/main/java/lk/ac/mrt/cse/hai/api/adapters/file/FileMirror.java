package lk.ac.mrt.cse.hai.api.adapters.file;

import java.nio.file.Path;

/**
 * Copies every change the file adapters make to durable storage. On Cloudflare the data folder lives on the
 * container's disk, which is wiped when the container sleeps, so each write is also sent to R2 (see
 * {@code R2Mirror}). Locally the folder itself is durable and nothing is copied.
 */
public interface FileMirror {

    /** No copy: the data folder is the only store. */
    FileMirror NONE = new FileMirror() {
        @Override
        public void put(Path file) {}

        @Override
        public void delete(Path file) {}

        @Override
        public void deleteTree(Path dir) {}
    };

    /** The file was created or replaced. */
    void put(Path file);

    /** The file was deleted. */
    void delete(Path file);

    /** The folder and everything in it was deleted. */
    void deleteTree(Path dir);
}
