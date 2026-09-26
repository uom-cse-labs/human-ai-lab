package lk.ac.mrt.cse.hai.api.domain.media;

/** A media rule was broken, e.g. an unsupported file type or deleting a photo that's in use. */
public class MediaRuleException extends RuntimeException {

    private final String code;

    public MediaRuleException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
