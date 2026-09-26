package lk.ac.mrt.cse.hai.api.domain.publishing;

public class PublishInProgressException extends RuntimeException {

    public PublishInProgressException() {
        super("Another publish is in progress. Try again in a moment.");
    }
}
