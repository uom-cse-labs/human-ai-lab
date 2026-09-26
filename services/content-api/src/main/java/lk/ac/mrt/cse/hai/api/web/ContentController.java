package lk.ac.mrt.cse.hai.api.web;

import lk.ac.mrt.cse.hai.api.contract.api.ContentApi;
import lk.ac.mrt.cse.hai.api.contract.model.ContentItem;
import lk.ac.mrt.cse.hai.api.contract.model.ContentItemInput;
import lk.ac.mrt.cse.hai.api.contract.model.ContentItemPage;
import lk.ac.mrt.cse.hai.api.contract.model.ContentType;
import lk.ac.mrt.cse.hai.api.domain.content.ContentService;
import lk.ac.mrt.cse.hai.api.domain.shared.Page;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

/** Editors manage drafts; deleting and unpublishing are admin-only (technical design §4.4). */
@RestController
@ConditionalOnProperty(prefix = "hai", name = "storage")
public class ContentController implements ContentApi {

    private final ContentService contents;

    public ContentController(ContentService contents) {
        this.contents = contents;
    }

    @Override
    public ResponseEntity<ContentItemPage> listContent(ContentType type, String cursor, Integer limit) {
        Page<lk.ac.mrt.cse.hai.api.domain.content.ContentItem> page = contents.list(ContentMapper.type(type), cursor, limit);
        return ResponseEntity.ok(new ContentItemPage()
                .items(page.items().stream().map(ContentMapper::dto).toList())
                .nextCursor(page.nextCursor()));
    }

    @Override
    public ResponseEntity<ContentItem> getContent(ContentType type, String id) {
        return ResponseEntity.ok(ContentMapper.dto(contents.get(ContentMapper.type(type), id)));
    }

    @Override
    public ResponseEntity<ContentItem> createContent(ContentType type, ContentItemInput input) {
        var created = contents.create(ContentMapper.type(type), ContentMapper.draft(input), CurrentUser.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(ContentMapper.dto(created));
    }

    @Override
    public ResponseEntity<ContentItem> updateContent(Integer ifMatch, ContentType type, String id, ContentItemInput input) {
        var updated = contents.update(ContentMapper.type(type), id, ContentMapper.draft(input), ifMatch, CurrentUser.name());
        return ResponseEntity.ok(ContentMapper.dto(updated));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContentItem> unpublishContent(ContentType type, String id) {
        return ResponseEntity.ok(ContentMapper.dto(contents.unpublish(ContentMapper.type(type), id, CurrentUser.name())));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContent(ContentType type, String id) {
        contents.delete(ContentMapper.type(type), id);
        return ResponseEntity.noContent().build();
    }
}
