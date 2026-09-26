package lk.ac.mrt.cse.hai.api.domain.contact;

/**
 * Delivers contact-form messages to the lab inbox. Messages are emailed, never stored.
 */
public class ContactService {

    private static final String DEFAULT_SUBJECT = "Message from the website";

    private final MailSender mailSender;
    private final String labInbox;

    public ContactService(MailSender mailSender, String labInbox) {
        this.mailSender = mailSender;
        this.labInbox = labInbox;
    }

    public ContactOutcome submit(ContactRequest request) {
        if (request.honeypot() != null && !request.honeypot().isBlank()) {
            return ContactOutcome.DISCARDED_AS_SPAM;
        }
        String subject = "[Human-AI Lab website] " + singleLine(
                request.subject() == null || request.subject().isBlank() ? DEFAULT_SUBJECT : request.subject());
        String body = """
                Name: %s
                Email: %s

                %s
                """.formatted(singleLine(request.name()), request.email(), request.message());
        mailSender.send(new OutgoingMail(labInbox, request.email(), subject, body));
        return ContactOutcome.SENT;
    }

    /** Removes line breaks so user input can't add email headers. */
    private static String singleLine(String value) {
        return value.replaceAll("[\\r\\n]+", " ").strip();
    }
}
