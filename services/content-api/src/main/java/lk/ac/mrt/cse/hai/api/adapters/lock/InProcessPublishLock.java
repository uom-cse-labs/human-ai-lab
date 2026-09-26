package lk.ac.mrt.cse.hai.api.adapters.lock;

import java.util.concurrent.atomic.AtomicReference;
import lk.ac.mrt.cse.hai.api.domain.publishing.PublishLock;

/** Local development: one process, so an in-memory lock is enough. AWS uses a DynamoDB lock item. */
public class InProcessPublishLock implements PublishLock {

    private final AtomicReference<String> holder = new AtomicReference<>();

    @Override
    public boolean tryAcquire(String owner) {
        return holder.compareAndSet(null, owner);
    }

    @Override
    public void release(String owner) {
        holder.compareAndSet(owner, null);
    }
}
