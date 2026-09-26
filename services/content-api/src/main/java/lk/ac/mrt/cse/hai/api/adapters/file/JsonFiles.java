package lk.ac.mrt.cse.hai.api.adapters.file;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import tools.jackson.databind.ObjectMapper;

/** Small helpers so every file write is atomic: readers never see half a file. */
final class JsonFiles {

    private JsonFiles() {}

    static void write(ObjectMapper json, Path file, Object value) {
        try {
            Files.createDirectories(file.getParent());
            Path tmp = Files.createTempFile(file.getParent(), ".tmp-", ".json");
            json.writeValue(tmp.toFile(), value);
            Files.move(tmp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
