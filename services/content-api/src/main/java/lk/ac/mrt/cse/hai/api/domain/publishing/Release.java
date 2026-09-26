package lk.ac.mrt.cse.hai.api.domain.publishing;

import java.time.Instant;

public record Release(String id, String publishedBy, Instant publishedAt, String note) {}
