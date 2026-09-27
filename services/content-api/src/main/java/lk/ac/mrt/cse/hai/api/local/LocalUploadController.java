package lk.ac.mrt.cse.hai.api.local;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import lk.ac.mrt.cse.hai.api.adapters.file.FileUploadInbox;
import lk.ac.mrt.cse.hai.api.domain.media.MediaAsset;
import lk.ac.mrt.cse.hai.api.domain.media.MediaService;
import lk.ac.mrt.cse.hai.api.domain.media.MediaStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Receives the browser's file upload, standing in for S3's presigned PUT URL: locally, and on Cloudflare, where
 * the dashboard Worker passes the upload through to the API. The dashboard sends the file here exactly as it
 * would to S3.
 */
@RestController
@Profile({"local", "cloudflare"})
public class LocalUploadController {

    private final MediaService media;
    private final FileUploadInbox inbox;

    public LocalUploadController(MediaService media, FileUploadInbox inbox) {
        this.media = media;
        this.inbox = inbox;
    }

    @PutMapping("/api/media/{id}/local-upload")
    public ResponseEntity<Void> upload(@PathVariable String id, HttpServletRequest request) throws IOException {
        MediaAsset asset = media.get(id);
        if (asset.status() != MediaStatus.UPLOADING) {
            return ResponseEntity.status(409).build();
        }
        inbox.write(id, request.getInputStream(), asset.sizeBytes());
        return ResponseEntity.ok().eTag("\"local-" + id + "\"").build();
    }
}
