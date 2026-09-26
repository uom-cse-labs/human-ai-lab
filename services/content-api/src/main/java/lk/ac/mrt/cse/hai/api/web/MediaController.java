package lk.ac.mrt.cse.hai.api.web;

import java.net.URI;
import java.time.ZoneOffset;
import java.util.List;
import lk.ac.mrt.cse.hai.api.contract.api.MediaApi;
import lk.ac.mrt.cse.hai.api.contract.model.EmbedRequest;
import lk.ac.mrt.cse.hai.api.contract.model.MediaAsset;
import lk.ac.mrt.cse.hai.api.contract.model.MediaAssetPage;
import lk.ac.mrt.cse.hai.api.contract.model.MediaKind;
import lk.ac.mrt.cse.hai.api.contract.model.MediaStatus;
import lk.ac.mrt.cse.hai.api.contract.model.MediaUpdate;
import lk.ac.mrt.cse.hai.api.contract.model.MediaUsage;
import lk.ac.mrt.cse.hai.api.contract.model.Rendition;
import lk.ac.mrt.cse.hai.api.contract.model.UploadCompletion;
import lk.ac.mrt.cse.hai.api.contract.model.UploadRequest;
import lk.ac.mrt.cse.hai.api.contract.model.UploadTicket;
import lk.ac.mrt.cse.hai.api.contract.model.UploadTicketPartsInner;
import lk.ac.mrt.cse.hai.api.domain.media.MediaRuleException;
import lk.ac.mrt.cse.hai.api.domain.media.MediaService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

/** The media library (technical design §3.6). Editors upload and describe; deleting and retrying are admin-only. */
@RestController
@ConditionalOnProperty(prefix = "hai", name = "storage")
public class MediaController implements MediaApi {

    private final MediaService media;

    public MediaController(MediaService media) {
        this.media = media;
    }

    @Override
    public ResponseEntity<MediaAssetPage> listMedia(String cursor, Integer limit) {
        var page = media.list(cursor, limit);
        return ResponseEntity.ok(new MediaAssetPage().items(page.items().stream().map(MediaController::dto).toList()).nextCursor(page.nextCursor()));
    }

    @Override
    public ResponseEntity<UploadTicket> startUpload(UploadRequest request) {
        var started = media.startUpload(request.getFileName(), request.getContentType().getValue(), request.getSizeBytes(), CurrentUser.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(new UploadTicket()
                .mediaId(started.asset().id())
                .uploadId(started.target().uploadId())
                .partSizeBytes(request.getSizeBytes())
                .parts(List.of(new UploadTicketPartsInner().partNumber(1).url(URI.create(started.target().url()))))
                .expiresAt(started.target().expiresAt().atOffset(ZoneOffset.UTC)));
    }

    @Override
    public ResponseEntity<MediaAsset> completeUpload(String id, UploadCompletion completion) {
        return ResponseEntity.ok(dto(media.completeUpload(id)));
    }

    @Override
    public ResponseEntity<MediaAsset> createEmbed(EmbedRequest request) {
        throw new MediaRuleException("NOT_AVAILABLE", "Video links arrive with video support. For now, add videos as links in the article text.");
    }

    @Override
    public ResponseEntity<MediaAsset> getMedia(String id) {
        return ResponseEntity.ok(dto(media.get(id)));
    }

    @Override
    public ResponseEntity<MediaAsset> updateMedia(String id, MediaUpdate update) {
        return ResponseEntity.ok(dto(media.describe(id, update.getAltText(), update.getCaption())));
    }

    @Override
    public ResponseEntity<List<MediaUsage>> getMediaUsage(String id) {
        return ResponseEntity.ok(media.usage(id).stream()
                .map(u -> new MediaUsage().kind(MediaUsage.KindEnum.fromValue(u.kind())).ref(u.ref()))
                .toList());
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MediaAsset> retryMedia(String id) {
        return ResponseEntity.accepted().body(dto(media.retry(id)));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedia(String id) {
        media.delete(id);
        return ResponseEntity.noContent().build();
    }

    static MediaAsset dto(lk.ac.mrt.cse.hai.api.domain.media.MediaAsset a) {
        return new MediaAsset()
                .id(a.id())
                .kind(MediaKind.fromValue(a.kind().name().toLowerCase()))
                .status(MediaStatus.fromValue(a.status().name().toLowerCase()))
                .failureReason(a.failureReason())
                .fileName(a.fileName())
                .src(a.src())
                .thumbnailSrc(a.thumbnailSrc())
                .altText(a.altText())
                .caption(a.caption())
                .width(a.width())
                .height(a.height())
                .renditions(a.renditions().stream()
                        .map(r -> new Rendition().key(r.src()).src(r.src()).format(Rendition.FormatEnum.fromValue(r.format()))
                                .role(Rendition.RoleEnum.fromValue(r.role())).width(r.width()).bytes(r.bytes()))
                        .toList())
                .uploadedBy(a.uploadedBy())
                .createdAt(a.createdAt().atOffset(ZoneOffset.UTC));
    }
}
