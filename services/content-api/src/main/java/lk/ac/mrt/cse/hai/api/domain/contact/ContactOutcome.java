package lk.ac.mrt.cse.hai.api.domain.contact;

public enum ContactOutcome {
    /** Handed to the mail provider for delivery to the lab inbox. */
    SENT,
    /** Honeypot was filled in. Reported to the caller as accepted, so bots learn nothing. */
    DISCARDED_AS_SPAM
}
