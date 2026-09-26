package lk.ac.mrt.cse.hai.api.domain.media;

import java.util.List;

/** Port: turns an uploaded original into safe, web-sized images (sharp in the AWS media Lambda). */
public interface ImageProcessor {

    /**
     * Checks the real file type from its contents, re-encodes the image (which drops location and camera data)
     * and produces sizes for the website.
     *
     * @throws RejectedFileException if the file isn't a supported image
     */
    ProcessedImage process(byte[] original, String declaredContentType);

    record Output(String fileName, byte[] data, String contentType, String format, int width) {}

    record ProcessedImage(int width, int height, List<Output> sizes) {}

    class RejectedFileException extends RuntimeException {
        public RejectedFileException(String reason) {
            super(reason);
        }
    }
}
