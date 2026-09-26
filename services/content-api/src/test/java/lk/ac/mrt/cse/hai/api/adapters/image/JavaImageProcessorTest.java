package lk.ac.mrt.cse.hai.api.adapters.image;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import javax.imageio.ImageIO;
import lk.ac.mrt.cse.hai.api.domain.media.ImageProcessor;
import org.junit.jupiter.api.Test;

class JavaImageProcessorTest {

    private final JavaImageProcessor processor = new JavaImageProcessor();

    /** A landscape photo: left half red, right half blue. */
    private static BufferedImage photo(int width, int height, int type) {
        BufferedImage image = new BufferedImage(width, height, type);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.RED);
        g.fillRect(0, 0, width / 2, height);
        g.setColor(Color.BLUE);
        g.fillRect(width / 2, 0, width - width / 2, height);
        g.dispose();
        return image;
    }

    private static byte[] encode(BufferedImage image, String format) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, format, out);
        return out.toByteArray();
    }

    /** Inserts an EXIF block with the given orientation and a fake GPS marker, like a phone camera does. */
    private static byte[] withExif(byte[] jpeg, int orientation) {
        ByteBuffer tiff = ByteBuffer.allocate(26);
        tiff.put("MM".getBytes(StandardCharsets.US_ASCII)).putShort((short) 42).putInt(8)
                .putShort((short) 1)
                .putShort((short) 0x0112).putShort((short) 3).putInt(1).putShort((short) orientation).putShort((short) 0)
                .putInt(0);
        byte[] gps = "GPS 6.7951N 79.9009E".getBytes(StandardCharsets.US_ASCII);
        int length = 2 + 6 + tiff.capacity() + gps.length;
        ByteBuffer out = ByteBuffer.allocate(jpeg.length + 2 + length);
        out.put(jpeg, 0, 2).put((byte) 0xFF).put((byte) 0xE1).putShort((short) length)
                .put("Exif\0\0".getBytes(StandardCharsets.US_ASCII)).put(tiff.array()).put(gps)
                .put(jpeg, 2, jpeg.length - 2);
        return out.array();
    }

    private static BufferedImage decode(ImageProcessor.Output output) throws Exception {
        return ImageIO.read(new ByteArrayInputStream(output.data()));
    }

    private static boolean contains(byte[] data, String text) {
        return new String(data, StandardCharsets.ISO_8859_1).contains(text);
    }

    @Test
    void makesWebSizesWithoutEnlarging() throws Exception {
        var large = processor.process(encode(photo(3000, 2000, BufferedImage.TYPE_INT_RGB), "jpg"), "image/jpeg");
        assertThat(large.sizes()).extracting(ImageProcessor.Output::width).containsExactly(480, 960, 1600);
        assertThat(large.width()).isEqualTo(3000);

        var small = processor.process(encode(photo(700, 400, BufferedImage.TYPE_INT_RGB), "jpg"), "image/jpeg");
        assertThat(small.sizes()).extracting(ImageProcessor.Output::width).containsExactly(480, 700);
    }

    @Test
    void phonePhotosComeOutUprightWithCameraAndLocationDataRemoved() throws Exception {
        byte[] upload = withExif(encode(photo(400, 200, BufferedImage.TYPE_INT_RGB), "jpg"), 6);
        assertThat(contains(upload, "Exif")).isTrue();
        assertThat(contains(upload, "GPS")).isTrue();

        var result = processor.process(upload, "image/jpeg");

        assertThat(result.width()).isEqualTo(200);
        assertThat(result.height()).isEqualTo(400);
        for (ImageProcessor.Output size : result.sizes()) {
            assertThat(contains(size.data(), "Exif")).as("EXIF removed").isFalse();
            assertThat(contains(size.data(), "GPS")).as("location removed").isFalse();
        }
        // Turned clockwise: the left (red) half of the stored photo is now at the top.
        BufferedImage upright = decode(result.sizes().getLast());
        assertThat(new Color(upright.getRGB(upright.getWidth() / 2, 10)).getRed()).isGreaterThan(200);
        assertThat(new Color(upright.getRGB(upright.getWidth() / 2, upright.getHeight() - 10)).getBlue()).isGreaterThan(200);
    }

    @Test
    void pngKeepsTransparency() throws Exception {
        var result = processor.process(encode(photo(300, 300, BufferedImage.TYPE_INT_ARGB), "png"), "image/png");
        assertThat(result.sizes()).allSatisfy(s -> assertThat(s.format()).isEqualTo("png"));
        assertThat(decode(result.sizes().getLast()).getColorModel().hasAlpha()).isTrue();
    }

    @Test
    void rejectsFilesThatAreNotReallyImages() {
        byte[] notAnImage = "<html><script>alert(1)</script></html>".getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> processor.process(notAnImage, "image/jpeg"))
                .isInstanceOf(ImageProcessor.RejectedFileException.class)
                .hasMessageContaining("isn't a JPEG, PNG or WebP");
    }

    @Test
    void rejectsTruncatedImages() throws Exception {
        byte[] jpeg = encode(photo(400, 200, BufferedImage.TYPE_INT_RGB), "jpg");
        byte[] truncated = java.util.Arrays.copyOf(jpeg, 40);
        assertThatThrownBy(() -> processor.process(truncated, "image/jpeg")).isInstanceOf(ImageProcessor.RejectedFileException.class);
    }
}
