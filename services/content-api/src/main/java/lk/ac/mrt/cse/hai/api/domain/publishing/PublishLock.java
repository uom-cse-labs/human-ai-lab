package lk.ac.mrt.cse.hai.api.domain.publishing;

/** Port: only one publish or rollback at a time (technical design §5.4). */
public interface PublishLock {

    /** @return false if another publish holds the lock */
    boolean tryAcquire(String owner);

    void release(String owner);
}
