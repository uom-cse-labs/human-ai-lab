package lk.ac.mrt.cse.hai.api.domain.publishing;

import java.util.List;

/** The content isn't ready to publish; nothing was published. */
public class PublishValidationException extends RuntimeException {

    /** @param field e.g. "news/n_1a2b3c4d.date" */
    public record Problem(String field, String message) {}

    private final List<Problem> problems;

    public PublishValidationException(List<Problem> problems) {
        super(problems.size() + " item(s) need fixing before publishing");
        this.problems = List.copyOf(problems);
    }

    public List<Problem> problems() {
        return problems;
    }
}
