package lk.ac.mrt.cse.hai.api.domain.publishing;

import java.util.Optional;

/** Port for the published files visitors read (S3 via CloudFront in AWS, a folder locally). */
public interface ReleaseStore {

    /** Writes every file of a new, immutable release. Visitors can't see it until {@link #pointTo}. */
    void write(Release release, Snapshot snapshot);

    /** Makes a release current with a single write of the pointer file. */
    void pointTo(Release release);

    Optional<String> currentReleaseId();
}
