package lk.ac.mrt.cse.hai.api.domain.media;

/**
 * One processed output of an upload.
 *
 * @param src    root-relative public path, e.g. /media/m_1a2b3c4d/1600.jpg
 * @param format jpg, png or webp
 * @param role   srcset (a size of the image) or placeholder (tiny preview)
 */
public record Rendition(String src, String format, String role, int width, long bytes) {}
