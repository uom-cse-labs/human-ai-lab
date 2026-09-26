package lk.ac.mrt.cse.hai.api.adapters.file;

/** Ids become file names, so only safe characters are allowed (no path traversal). */
final class SafeIds {

    private SafeIds() {}

    static String check(String id) {
        if (id == null || !id.matches("[A-Za-z0-9_-]{1,64}")) {
            throw new IllegalArgumentException("Invalid id");
        }
        return id;
    }
}
