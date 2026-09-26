package lk.ac.mrt.cse.hai.api.domain.content;

public enum ContentType {
    NEWS("news"),
    PROJECT("project"),
    MEMBER("member"),
    PUBLICATION("publication"),
    THEME("theme"),
    GALLERY("gallery"),
    PAGE_SECTION("page-section"),
    SITE_SETTINGS("site-settings");

    private final String key;

    ContentType(String key) {
        this.key = key;
    }

    public String key() {
        return key;
    }

    public static ContentType fromKey(String key) {
        for (ContentType type : values()) {
            if (type.key.equals(key)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown content type: " + key);
    }
}
