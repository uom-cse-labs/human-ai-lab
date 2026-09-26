package lk.ac.mrt.cse.hai.api.domain.media;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lk.ac.mrt.cse.hai.api.domain.content.ContentItem;
import lk.ac.mrt.cse.hai.api.domain.content.ContentRepository;
import lk.ac.mrt.cse.hai.api.domain.content.ContentType;
import lk.ac.mrt.cse.hai.api.domain.shared.NotFoundException;
import lk.ac.mrt.cse.hai.api.domain.shared.Page;

/**
 * The media library (technical design §3.6, §5.6, SC-2): upload photos once, describe them, use them anywhere.
 * Files go straight from the browser to the upload inbox, never through the API.
 */
public class MediaService {

    /** What editors can upload in this release. Videos follow with the MediaConvert pipeline. */
    public static final Map<String, String> IMAGE_TYPES = Map.of("image/jpeg", "JPEG", "image/png", "PNG", "image/webp", "WebP");
    public static final long MAX_IMAGE_BYTES = 25L * 1024 * 1024;

    /** A place a media asset is used: content item or slot. */
    public record Usage(String kind, String ref, String title) {}

    private final MediaRepository media;
    private final UploadInbox inbox;
    private final MediaLibrary library;
    private final ImageProcessor processor;
    private final ContentRepository contents;
    private final Clock clock;

    /** @param processor null when processing runs elsewhere (the media Lambda in AWS) */
    public MediaService(MediaRepository media, UploadInbox inbox, MediaLibrary library, ImageProcessor processor,
            ContentRepository contents, Clock clock) {
        this.media = media;
        this.inbox = inbox;
        this.library = library;
        this.processor = processor;
        this.contents = contents;
        this.clock = clock;
    }

    public record StartedUpload(MediaAsset asset, UploadInbox.UploadTarget target) {}

    public StartedUpload startUpload(String fileName, String contentType, long sizeBytes, String user) {
        if (contentType.startsWith("video/")) {
            throw new MediaRuleException("UNSUPPORTED_MEDIA_TYPE",
                    "Video uploads aren't available yet. For now, upload videos to YouTube and link to them.");
        }
        if (!IMAGE_TYPES.containsKey(contentType)) {
            throw new MediaRuleException("UNSUPPORTED_MEDIA_TYPE",
                    "This file type can't be uploaded. Use a JPEG, PNG or WebP photo (iPhone photos: export as JPEG).");
        }
        if (sizeBytes > MAX_IMAGE_BYTES) {
            throw new MediaRuleException("FILE_TOO_LARGE",
                    "This photo is %.1f MB. The limit is 25 MB; export a smaller version and try again.".formatted(sizeBytes / 1_048_576.0));
        }
        String id = "m_" + UUID.randomUUID().toString().substring(0, 8);
        MediaAsset asset = new MediaAsset(id, MediaKind.IMAGE, MediaStatus.UPLOADING, null, fileName, contentType, sizeBytes,
                null, null, null, null, null, List.of(), user, clock.instant());
        media.save(asset);
        return new StartedUpload(asset, inbox.createTarget(id, contentType, sizeBytes));
    }

    /** The browser finished uploading. Processing starts now (locally) or on the upload event (AWS). */
    public MediaAsset completeUpload(String id) {
        MediaAsset asset = get(id);
        if (asset.status() != MediaStatus.UPLOADING) {
            return asset;
        }
        if (inbox.read(id) == null) {
            throw new MediaRuleException("UPLOAD_MISSING", "The file didn't arrive. Upload it again.");
        }
        MediaAsset processing = asset.withStatus(MediaStatus.PROCESSING, null);
        media.save(processing);
        return processor == null ? processing : process(processing);
    }

    /** Admins can re-run processing of a failed upload from the kept original. */
    public MediaAsset retry(String id) {
        MediaAsset asset = get(id);
        if (asset.status() != MediaStatus.FAILED) {
            return asset;
        }
        MediaAsset processing = asset.withStatus(MediaStatus.PROCESSING, null);
        media.save(processing);
        return processor == null ? processing : process(processing);
    }

    MediaAsset process(MediaAsset asset) {
        byte[] original = inbox.read(asset.id());
        try {
            ImageProcessor.ProcessedImage image = processor.process(original, asset.contentType());
            List<Rendition> renditions = new ArrayList<>();
            for (ImageProcessor.Output size : image.sizes()) {
                String src = library.put(asset.id(), size.fileName(), size.data(), size.contentType());
                renditions.add(new Rendition(src, size.format(), "srcset", size.width(), size.data().length));
            }
            MediaAsset ready = asset.processed(image.width(), image.height(), renditions);
            media.save(ready);
            return ready;
        } catch (ImageProcessor.RejectedFileException e) {
            MediaAsset failed = asset.withStatus(MediaStatus.FAILED, e.getMessage());
            media.save(failed);
            return failed;
        }
    }

    public MediaAsset describe(String id, String altText, String caption) {
        MediaAsset asset = get(id);
        MediaAsset described = asset.described(
                altText == null ? asset.altText() : altText.strip(),
                caption == null ? asset.caption() : caption.strip());
        media.save(described);
        return described;
    }

    public MediaAsset get(String id) {
        return media.get(id).orElseThrow(() -> new NotFoundException("media " + id));
    }

    public Page<MediaAsset> list(String cursor, int limit) {
        return Page.of(media.list(), cursor, limit);
    }

    /** Content items that reference the asset, whether drafts or published. */
    public List<Usage> usage(String id) {
        List<Usage> usage = new ArrayList<>();
        for (ContentType type : ContentType.values()) {
            for (ContentItem item : contents.list(type)) {
                if (item.mediaRefs().contains(id)) {
                    usage.add(new Usage("content", type.key() + "/" + item.id(), item.title()));
                }
            }
        }
        return usage;
    }

    /** Deletes an unused asset and its files. Admins only. */
    public void delete(String id) {
        get(id);
        List<Usage> usage = usage(id);
        if (!usage.isEmpty()) {
            throw new MediaRuleException("MEDIA_IN_USE", "This photo is used by " + usage.size()
                    + " item(s), e.g. \"" + usage.getFirst().title() + "\". Remove it from them first.");
        }
        library.delete(id);
        inbox.delete(id);
        media.delete(id);
    }
}
