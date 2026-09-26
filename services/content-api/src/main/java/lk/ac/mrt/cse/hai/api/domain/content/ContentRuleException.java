package lk.ac.mrt.cse.hai.api.domain.content;

/** A business rule was broken, e.g. a duplicate slug or deleting live content. */
public class ContentRuleException extends RuntimeException {

    private final String code;

    public ContentRuleException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
