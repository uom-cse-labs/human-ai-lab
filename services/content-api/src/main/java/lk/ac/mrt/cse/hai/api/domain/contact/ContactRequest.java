package lk.ac.mrt.cse.hai.api.domain.contact;

/**
 * A message submitted through the public contact form. Field formats are validated at the API edge;
 * {@code honeypot} is a hidden form field that people leave empty and bots tend to fill.
 */
public record ContactRequest(String name, String email, String subject, String message, String honeypot) {}
