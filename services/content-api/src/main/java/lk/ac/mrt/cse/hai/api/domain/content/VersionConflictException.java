package lk.ac.mrt.cse.hai.api.domain.content;

/** Someone else saved the item first. Carries the latest version so the editor can reload. */
public class VersionConflictException extends RuntimeException {

    private final transient ContentItem current;

    public VersionConflictException(ContentItem current) {
        super("Changed by " + current.updatedBy() + " at " + current.updatedAt() + " (now version " + current.version() + ")");
        this.current = current;
    }

    public ContentItem current() {
        return current;
    }
}
