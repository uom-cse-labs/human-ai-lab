package lk.ac.mrt.cse.hai.api.domain.media;

/** Port: processed files that the website serves under /media (the S3 media bucket in AWS, a folder locally). */
public interface MediaLibrary {

    /** Stores a rendition and returns its root-relative public path, e.g. /media/m_1a2b3c4d/1600.jpg. */
    String put(String mediaId, String fileName, byte[] data, String contentType);

    void delete(String mediaId);
}
