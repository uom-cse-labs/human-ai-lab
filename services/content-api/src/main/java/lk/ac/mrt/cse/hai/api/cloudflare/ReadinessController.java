package lk.ac.mrt.cse.hai.api.cloudflare;

import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Cloudflare only: the Worker polls this after starting the container. It answers 200 once start-up has
 * finished, including restoring data from R2 and the first-deploy content import, so the site Worker knows
 * the first release exists. Not under /api: the Workers never route it from the internet.
 */
@RestController
@Profile("cloudflare")
public class ReadinessController {

    private final AtomicBoolean ready = new AtomicBoolean();

    @EventListener(ApplicationReadyEvent.class)
    void onReady() {
        ready.set(true);
    }

    @GetMapping("/internal/ready")
    public ResponseEntity<Void> ready() {
        return ResponseEntity.status(ready.get() ? 200 : 503).build();
    }
}
