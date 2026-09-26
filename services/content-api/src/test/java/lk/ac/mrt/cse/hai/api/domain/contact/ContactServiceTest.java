package lk.ac.mrt.cse.hai.api.domain.contact;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class ContactServiceTest {

    private final List<OutgoingMail> sent = new ArrayList<>();
    private final ContactService service = new ContactService(sent::add, "lab@example.org");

    @Test
    void sendsToTheLabInboxWithReplyToTheVisitor() {
        ContactOutcome outcome = service.submit(
                new ContactRequest("Asha", "asha@example.com", "Internships", "Hello lab", ""));

        assertThat(outcome).isEqualTo(ContactOutcome.SENT);
        assertThat(sent).singleElement().satisfies(mail -> {
            assertThat(mail.to()).isEqualTo("lab@example.org");
            assertThat(mail.replyTo()).isEqualTo("asha@example.com");
            assertThat(mail.subject()).isEqualTo("[Human-AI Lab website] Internships");
            assertThat(mail.body()).contains("Asha", "Hello lab");
        });
    }

    @Test
    void discardsMessagesThatFillTheHoneypot() {
        ContactOutcome outcome = service.submit(
                new ContactRequest("Bot", "bot@example.com", null, "Buy now", "https://spam.example"));

        assertThat(outcome).isEqualTo(ContactOutcome.DISCARDED_AS_SPAM);
        assertThat(sent).isEmpty();
    }

    @Test
    void stripsLineBreaksSoInputCannotAddHeaders() {
        service.submit(new ContactRequest("Eve\r\nBcc: x@example.com", "eve@example.com",
                "Hi\nBcc: y@example.com", "text", null));

        assertThat(sent.getFirst().subject()).doesNotContain("\n").doesNotContain("\r");
        assertThat(sent.getFirst().body()).startsWith("Name: Eve Bcc: x@example.com");
    }

    @Test
    void usesADefaultSubjectWhenNoneIsGiven() {
        service.submit(new ContactRequest("Asha", "asha@example.com", " ", "Hello", null));

        assertThat(sent.getFirst().subject()).isEqualTo("[Human-AI Lab website] Message from the website");
    }
}
