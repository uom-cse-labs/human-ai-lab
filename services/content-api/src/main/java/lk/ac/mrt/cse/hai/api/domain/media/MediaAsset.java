package lk.ac.mrt.cse.hai.api.domain.media;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/** An uploaded photo (videos and embeds follow the same lifecycle; technical design §4.2, §5.2). */
public record MediaAsset(
        String id,
        MediaKind kind,
        MediaStatus status,
        String failureReason,
        String fileName,
        String contentType,
        long sizeBytes,
        String altText,
        String caption,
        Integer width,
        Integer height,
        String embedUrl,
        List<Rendition> renditions,
        String uploadedBy,
        Instant createdAt) {

    public MediaAsset {
        renditions = renditions == null ? List.of() : List.copyOf(renditions);
    }

    /** The largest rendition: what the website shows. */
    public String src() {
        return renditions.stream().filter(r -> "srcset".equals(r.role()))
                .max(Comparator.comparingInt(Rendition::width)).map(Rendition::src).orElse(null);
    }

    /** The smallest rendition: for the dashboard's library grid. */
    public String thumbnailSrc() {
        return renditions.stream().filter(r -> "srcset".equals(r.role()))
                .min(Comparator.comparingInt(Rendition::width)).map(Rendition::src).orElse(null);
    }

    MediaAsset withStatus(MediaStatus newStatus, String reason) {
        return new MediaAsset(id, kind, newStatus, reason, fileName, contentType, sizeBytes, altText, caption, width, height,
                embedUrl, renditions, uploadedBy, createdAt);
    }

    MediaAsset processed(int newWidth, int newHeight, List<Rendition> newRenditions) {
        return new MediaAsset(id, kind, MediaStatus.READY, null, fileName, contentType, sizeBytes, altText, caption, newWidth,
                newHeight, embedUrl, newRenditions, uploadedBy, createdAt);
    }

    MediaAsset described(String newAltText, String newCaption) {
        return new MediaAsset(id, kind, status, failureReason, fileName, contentType, sizeBytes, newAltText, newCaption, width,
                height, embedUrl, renditions, uploadedBy, createdAt);
    }
}
