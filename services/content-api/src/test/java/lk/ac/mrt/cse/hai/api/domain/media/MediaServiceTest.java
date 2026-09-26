package lk.ac.mrt.cse.hai.api.domain.media;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.imageio.ImageIO;
import lk.ac.mrt.cse.hai.api.adapters.image.JavaImageProcessor;
import lk.ac.mrt.cse.hai.api.domain.content.ContentDraft;
import lk.ac.mrt.cse.hai.api.domain.content.ContentService;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.content.InMemoryContentRepository;
import org.junit.jupiter.api.Test;

public class MediaServiceTest {

    private final Map<String, byte[]> uploads = new HashMap<>();
    private final Map<String, byte[]> library = new LinkedHashMap<>();
    private final MemoryMedia records = new MemoryMedia();
    private final InMemoryContentRepository contents = new InMemoryContentRepository();
    private final MediaService media = new MediaService(records,
            new UploadInbox() {
                public UploadTarget createTarget(String id, String type, long size) { return new UploadTarget("/upload/" + id, "u-" + id, Instant.EPOCH); }
                public byte[] read(String id) { return uploads.get(id); }
                public void delete(String id) { uploads.remove(id); }
            },
            new MediaLibrary() {
                public String put(String id, String name, byte[] data, String type) { library.put(id + "/" + name, data); return "/media/" + id + "/" + name; }
                public void delete(String id) { library.keySet().removeIf(k -> k.startsWith(id + "/")); }
            },
            new JavaImageProcessor(), contents, Clock.systemUTC());

    private static byte[] jpeg(int width, int height) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), "jpg", out);
        return out.toByteArray();
    }

    private MediaAsset uploadPhoto() throws Exception {
        byte[] photo = jpeg(2000, 1000);
        var started = media.startUpload("lab.jpg", "image/jpeg", photo.length, "editor");
        uploads.put(started.asset().id(), photo);
        return media.completeUpload(started.asset().id());
    }

    @Test
    void uploadedPhotosBecomeReadyWithWebSizes() throws Exception {
        MediaAsset ready = uploadPhoto();

        assertThat(ready.status()).isEqualTo(MediaStatus.READY);
        assertThat(ready.width()).isEqualTo(2000);
        assertThat(ready.src()).isEqualTo("/media/" + ready.id() + "/1600.jpg");
        assertThat(ready.thumbnailSrc()).isEqualTo("/media/" + ready.id() + "/480.jpg");
        assertThat(library).hasSize(3);
    }

    @Test
    void rejectsVideosUnsupportedTypesAndOversizedFiles() {
        assertThatThrownBy(() -> media.startUpload("clip.mp4", "video/mp4", 1000, "editor"))
                .hasMessageContaining("YouTube");
        assertThatThrownBy(() -> media.startUpload("photo.heic", "image/heic", 1000, "editor"))
                .hasMessageContaining("export as JPEG");
        assertThatThrownBy(() -> media.startUpload("big.jpg", "image/jpeg", 30L * 1024 * 1024, "editor"))
                .isInstanceOfSatisfying(MediaRuleException.class, e -> assertThat(e.code()).isEqualTo("FILE_TOO_LARGE"));
        assertThat(records.list()).isEmpty();
    }

    @Test
    void completingWithoutAFileIsRefused() {
        var started = media.startUpload("lab.jpg", "image/jpeg", 100, "editor");
        assertThatThrownBy(() -> media.completeUpload(started.asset().id()))
                .isInstanceOfSatisfying(MediaRuleException.class, e -> assertThat(e.code()).isEqualTo("UPLOAD_MISSING"));
    }

    @Test
    void badFilesFailWithAReasonAndCanBeRetried() {
        var started = media.startUpload("fake.jpg", "image/jpeg", 10, "editor");
        uploads.put(started.asset().id(), "not a photo".getBytes());

        MediaAsset failed = media.completeUpload(started.asset().id());
        assertThat(failed.status()).isEqualTo(MediaStatus.FAILED);
        assertThat(failed.failureReason()).contains("isn't a JPEG");
        assertThat(media.retry(failed.id()).status()).isEqualTo(MediaStatus.FAILED);
    }

    @Test
    void photosInUseCannotBeDeleted() throws Exception {
        MediaAsset photo = uploadPhoto();
        new ContentService(contents, Clock.systemUTC()).create(ContentType.MEMBER,
                new ContentDraft("asha", "Asha", null, null, Map.of("imageUrl", photo.src()), List.of(photo.id())), "editor");

        assertThat(media.usage(photo.id())).singleElement().satisfies(u -> assertThat(u.title()).isEqualTo("Asha"));
        assertThatThrownBy(() -> media.delete(photo.id()))
                .isInstanceOfSatisfying(MediaRuleException.class, e -> assertThat(e.code()).isEqualTo("MEDIA_IN_USE"));
    }

    @Test
    void unusedPhotosAreDeletedWithTheirFiles() throws Exception {
        MediaAsset photo = uploadPhoto();
        media.delete(photo.id());
        assertThat(records.get(photo.id())).isEmpty();
        assertThat(library).isEmpty();
        assertThat(uploads).isEmpty();
    }

    @Test
    void altTextIsStoredTrimmed() throws Exception {
        MediaAsset photo = uploadPhoto();
        assertThat(media.describe(photo.id(), "  Students at the robotics demo  ", null).altText())
                .isEqualTo("Students at the robotics demo");
    }

    public static class MemoryMedia implements MediaRepository {
        private final Map<String, MediaAsset> assets = new LinkedHashMap<>();
        public void save(MediaAsset a) { assets.put(a.id(), a); }
        public Optional<MediaAsset> get(String id) { return Optional.ofNullable(assets.get(id)); }
        public List<MediaAsset> list() { return List.copyOf(assets.values()); }
        public void delete(String id) { assets.remove(id); }
    }
}
