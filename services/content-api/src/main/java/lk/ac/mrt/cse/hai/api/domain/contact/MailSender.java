package lk.ac.mrt.cse.hai.api.domain.contact;

/** Port for delivering email. Implemented by adapters (SES in AWS, logging locally). */
public interface MailSender {

    /** @throws MailDeliveryException if the provider rejects or fails to accept the message */
    void send(OutgoingMail mail);
}
