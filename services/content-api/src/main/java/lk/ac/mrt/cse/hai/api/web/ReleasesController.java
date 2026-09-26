package lk.ac.mrt.cse.hai.api.web;

import lk.ac.mrt.cse.hai.api.contract.api.ReleasesApi;
import lk.ac.mrt.cse.hai.api.contract.model.PublishRequest;
import lk.ac.mrt.cse.hai.api.contract.model.Release;
import lk.ac.mrt.cse.hai.api.contract.model.ReleasePage;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

/** Publishing and rollback are admin-only (technical design §4.4, SC-3, SC-4). */
@RestController
@ConditionalOnProperty(prefix = "hai", name = "storage")
@PreAuthorize("hasRole('ADMIN')")
public class ReleasesController implements ReleasesApi {

    private final PublishService publishing;

    public ReleasesController(PublishService publishing) {
        this.publishing = publishing;
    }

    @Override
    public ResponseEntity<Release> publish(PublishRequest request) {
        var release = publishing.publish(request.getNote(), CurrentUser.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(ContentMapper.dto(release, release.id()));
    }

    @Override
    public ResponseEntity<ReleasePage> listReleases(String cursor, Integer limit) {
        var page = publishing.list(cursor, limit);
        String current = publishing.currentReleaseId();
        return ResponseEntity.ok(new ReleasePage()
                .items(page.items().stream().map(r -> ContentMapper.dto(r, current)).toList())
                .nextCursor(page.nextCursor()));
    }

    @Override
    public ResponseEntity<Release> restoreRelease(String id) {
        var release = publishing.restore(id, CurrentUser.name());
        return ResponseEntity.ok(ContentMapper.dto(release, release.id()));
    }
}
