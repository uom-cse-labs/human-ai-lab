package lk.ac.mrt.cse.hai.api.domain.content;

public enum ContentStatus {
    /** Never published. */
    DRAFT,
    /** In the current release. May have newer, unpublished edits ({@code version > publishedVersion}). */
    PUBLISHED,
    /** Hidden from the next release. */
    UNPUBLISHED
}
