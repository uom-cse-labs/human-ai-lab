package lk.ac.mrt.cse.hai.api.domain.shared;

import java.util.List;

/** One page of results. {@code nextCursor} is null on the last page. */
public record Page<T>(List<T> items, String nextCursor) {

    /** Offset pagination over an in-memory list; enough for the lab's content volumes. */
    public static <T> Page<T> of(List<T> all, String cursor, int limit) {
        int from = cursor == null ? 0 : Math.max(0, Integer.parseInt(cursor));
        int to = Math.min(all.size(), from + limit);
        return new Page<>(all.subList(Math.min(from, to), to), to < all.size() ? String.valueOf(to) : null);
    }
}
