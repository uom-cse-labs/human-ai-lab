package lk.ac.mrt.cse.hai.api.adapters.image;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import lk.ac.mrt.cse.hai.api.domain.media.ImageProcessor;

/**
 * Processes photos with the JDK's image libraries (used locally; the AWS media Lambda uses sharp and also
 * produces WebP/AVIF). Every JPEG and PNG is decoded and re-encoded, which drops EXIF data such as GPS
 * location. WebP files can't be re-encoded by the JDK and are rejected when they carry EXIF data.
 */
public class JavaImageProcessor implements ImageProcessor {

    /** Widths offered to the website; a photo is never enlarged. */
    static final int[] WIDTHS = {480, 960, 1600};
    /** Guards against "decompression bombs": small files that decode into enormous images. */
    static final long MAX_PIXELS = 50_000_000L;

    @Override
    public ProcessedImage process(byte[] original, String declaredContentType) {
        String actual = sniff(original);
        if (actual == null) {
            throw new RejectedFileException("This file isn't a JPEG, PNG or WebP image, whatever its name says.");
        }
        if (actual.equals("webp")) {
            return webp(original);
        }
        BufferedImage image = decode(original);
        if (actual.equals("jpg")) {
            image = applyExifOrientation(image, exifOrientation(original));
        }
        List<Output> sizes = new ArrayList<>();
        for (int width : targetWidths(image.getWidth())) {
            BufferedImage resized = resize(image, width, actual.equals("jpg"));
            byte[] data = actual.equals("jpg") ? jpeg(resized) : png(resized);
            sizes.add(new Output(width + "." + actual, data, actual.equals("jpg") ? "image/jpeg" : "image/png", actual, width));
        }
        return new ProcessedImage(image.getWidth(), image.getHeight(), sizes);
    }

    static String sniff(byte[] b) {
        if (b.length > 3 && (b[0] & 0xff) == 0xFF && (b[1] & 0xff) == 0xD8 && (b[2] & 0xff) == 0xFF) {
            return "jpg";
        }
        if (b.length > 8 && (b[0] & 0xff) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return "png";
        }
        if (b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "webp";
        }
        return null;
    }

    private static List<Integer> targetWidths(int originalWidth) {
        List<Integer> widths = new ArrayList<>();
        for (int w : WIDTHS) {
            if (w < originalWidth) {
                widths.add(w);
            }
        }
        widths.add(Math.min(originalWidth, WIDTHS[WIDTHS.length - 1]));
        return widths.stream().distinct().toList();
    }

    private static BufferedImage decode(byte[] data) {
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(data))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                throw new RejectedFileException("This image can't be read. Try exporting it again as JPEG.");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in);
                if ((long) reader.getWidth(0) * reader.getHeight(0) > MAX_PIXELS) {
                    throw new RejectedFileException("This image is too large in pixels. Resize it below 50 megapixels.");
                }
                return reader.read(0);
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            throw new RejectedFileException("This image is damaged or incomplete. Try exporting it again.");
        }
    }

    private static BufferedImage resize(BufferedImage source, int width, boolean opaque) {
        int height = Math.max(1, Math.round(source.getHeight() * (width / (float) source.getWidth())));
        BufferedImage target = new BufferedImage(width, height, opaque ? BufferedImage.TYPE_INT_RGB : BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = target.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(source, 0, 0, width, height, null);
        g.dispose();
        return target;
    }

    private static byte[] jpeg(BufferedImage image) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(out)) {
            ImageWriteParam params = writer.getDefaultWriteParam();
            params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            params.setCompressionQuality(0.85f);
            writer.setOutput(ios);
            writer.write(null, new IIOImage(image, null, null), params);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } finally {
            writer.dispose();
        }
        return out.toByteArray();
    }

    private static byte[] png(BufferedImage image) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            ImageIO.write(image, "png", out);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return out.toByteArray();
    }

    // ------------------------------------------------------------------ WebP (validated, not re-encoded)

    private static ProcessedImage webp(byte[] data) {
        int[] size = webpSize(data);
        if (size == null) {
            throw new RejectedFileException("This WebP image can't be read. Try uploading a JPEG instead.");
        }
        if (containsExif(data)) {
            throw new RejectedFileException("This WebP image contains camera or location data. Upload it as JPEG so that data can be removed.");
        }
        return new ProcessedImage(size[0], size[1], List.of(new Output(size[0] + ".webp", data, "image/webp", "webp", size[0])));
    }

    static int[] webpSize(byte[] b) {
        ByteBuffer buf = ByteBuffer.wrap(b).order(ByteOrder.LITTLE_ENDIAN);
        String chunk = new String(b, 12, 4, java.nio.charset.StandardCharsets.US_ASCII);
        switch (chunk) {
            case "VP8X":
                return new int[] {1 + (buf.getInt(24) & 0xFFFFFF), 1 + (buf.getInt(27) & 0xFFFFFF)};
            case "VP8 ":
                return new int[] {buf.getShort(26) & 0x3FFF, buf.getShort(28) & 0x3FFF};
            case "VP8L":
                int bits = buf.getInt(21);
                return new int[] {(bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1};
            default:
                return null;
        }
    }

    private static boolean containsExif(byte[] b) {
        for (int i = 12; i + 4 <= b.length; i++) {
            if (b[i] == 'E' && b[i + 1] == 'X' && b[i + 2] == 'I' && b[i + 3] == 'F') {
                return true;
            }
        }
        return false;
    }

    // ------------------------------------------------------------------ EXIF orientation (phone photos)

    /** Reads the EXIF orientation (1–8) from a JPEG, or 1 if absent. */
    static int exifOrientation(byte[] jpeg) {
        int i = 2;
        while (i + 4 < jpeg.length && (jpeg[i] & 0xff) == 0xFF) {
            int marker = jpeg[i + 1] & 0xff;
            int length = ((jpeg[i + 2] & 0xff) << 8) | (jpeg[i + 3] & 0xff);
            if (marker == 0xE1 && i + 10 < jpeg.length && jpeg[i + 4] == 'E' && jpeg[i + 5] == 'x' && jpeg[i + 6] == 'i' && jpeg[i + 7] == 'f') {
                return orientationFromTiff(jpeg, i + 10, Math.min(jpeg.length, i + 2 + length));
            }
            if (marker == 0xDA) {
                break;
            }
            i += 2 + length;
        }
        return 1;
    }

    private static int orientationFromTiff(byte[] b, int tiff, int end) {
        try {
            ByteBuffer buf = ByteBuffer.wrap(b, 0, end);
            buf.order(b[tiff] == 'I' ? ByteOrder.LITTLE_ENDIAN : ByteOrder.BIG_ENDIAN);
            int ifd = tiff + buf.getInt(tiff + 4);
            int entries = buf.getShort(ifd) & 0xFFFF;
            for (int e = 0; e < entries; e++) {
                int entry = ifd + 2 + e * 12;
                if ((buf.getShort(entry) & 0xFFFF) == 0x0112) {
                    int value = buf.getShort(entry + 8) & 0xFFFF;
                    return value >= 1 && value <= 8 ? value : 1;
                }
            }
        } catch (IndexOutOfBoundsException ignored) {
            // Malformed EXIF: treat as upright.
        }
        return 1;
    }

    /**
     * Turns the stored pixels upright. EXIF orientations: 2 mirrored, 3 upside down, 4 mirrored upside down,
     * 5 transposed, 6 turned 90° clockwise, 7 transversed, 8 turned 90° anticlockwise.
     */
    static BufferedImage applyExifOrientation(BufferedImage image, int orientation) {
        return switch (orientation) {
            case 2 -> mirror(image);
            case 3 -> turnClockwise(turnClockwise(image));
            case 4 -> mirror(turnClockwise(turnClockwise(image)));
            case 5 -> mirror(turnClockwise(image));
            case 6 -> turnClockwise(image);
            case 7 -> mirror(turnClockwise(turnClockwise(turnClockwise(image))));
            case 8 -> turnClockwise(turnClockwise(turnClockwise(image)));
            default -> image;
        };
    }

    private static BufferedImage turnClockwise(BufferedImage in) {
        int w = in.getWidth();
        int h = in.getHeight();
        BufferedImage out = new BufferedImage(h, w, in.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                out.setRGB(h - 1 - y, x, in.getRGB(x, y));
            }
        }
        return out;
    }

    private static BufferedImage mirror(BufferedImage in) {
        int w = in.getWidth();
        int h = in.getHeight();
        BufferedImage out = new BufferedImage(w, h, in.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                out.setRGB(w - 1 - x, y, in.getRGB(x, y));
            }
        }
        return out;
    }
}
