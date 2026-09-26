package lk.ac.mrt.cse.hai.api.domain.publishing;

import java.util.List;
import java.util.Optional;

/** Port for the history of releases. */
public interface ReleaseLog {

    void record(Release release);

    /** Newest first. */
    List<Release> list();

    Optional<Release> get(String id);
}
