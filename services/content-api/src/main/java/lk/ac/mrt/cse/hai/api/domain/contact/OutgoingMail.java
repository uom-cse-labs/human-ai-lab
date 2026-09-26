package lk.ac.mrt.cse.hai.api.domain.contact;

public record OutgoingMail(String to, String replyTo, String subject, String body) {}
