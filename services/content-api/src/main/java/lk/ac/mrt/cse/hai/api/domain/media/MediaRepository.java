package lk.ac.mrt.cse.hai.api.domain.media;

import java.util.List;
import java.util.Optional;

/** Port: media records (DynamoDB in AWS, files locally). */
public interface MediaRepository {

    void save(MediaAsset asset);

    Optional<MediaAsset> get(String id);

    /** Newest first. */
    List<MediaAsset> list();

    void delete(String id);
}
