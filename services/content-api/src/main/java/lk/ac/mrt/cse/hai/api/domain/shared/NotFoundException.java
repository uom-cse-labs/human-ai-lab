package lk.ac.mrt.cse.hai.api.domain.shared;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String what) {
        super(what + " not found");
    }
}
