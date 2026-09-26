package lk.ac.mrt.cse.hai.api.domain.media;

/**
 * Port: the private inbox that browsers upload originals to (the S3 uploads bucket with presigned URLs in AWS,
 * a folder locally). Originals are kept so they can be processed again.
 */
public interface UploadInbox {

    /** Where the browser should send the file. */
    UploadTarget createTarget(String mediaId, String contentType, long sizeBytes);

    /** @return the uploaded original, or null if nothing has arrived */
    byte[] read(String mediaId);

    void delete(String mediaId);

    /**
     * @param url      the browser PUTs the file's bytes here
     * @param uploadId identifies the upload when completing it
     */
    record UploadTarget(String url, String uploadId, java.time.Instant expiresAt) {}
}
