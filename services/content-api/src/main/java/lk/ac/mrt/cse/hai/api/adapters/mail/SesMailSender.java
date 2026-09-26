package lk.ac.mrt.cse.hai.api.adapters.mail;

import lk.ac.mrt.cse.hai.api.domain.contact.MailDeliveryException;
import lk.ac.mrt.cse.hai.api.domain.contact.MailSender;
import lk.ac.mrt.cse.hai.api.domain.contact.OutgoingMail;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.sesv2.SesV2Client;

public class SesMailSender implements MailSender {

    private final SesV2Client ses;
    private final String fromAddress;

    public SesMailSender(SesV2Client ses, String fromAddress) {
        this.ses = ses;
        this.fromAddress = fromAddress;
    }

    @Override
    public void send(OutgoingMail mail) {
        try {
            ses.sendEmail(request -> request
                    .fromEmailAddress(fromAddress)
                    .destination(d -> d.toAddresses(mail.to()))
                    .replyToAddresses(mail.replyTo())
                    .content(c -> c.simple(m -> m
                            .subject(s -> s.data(mail.subject()).charset("UTF-8"))
                            .body(b -> b.text(t -> t.data(mail.body()).charset("UTF-8"))))));
        } catch (SdkException e) {
            throw new MailDeliveryException("SES did not accept the message", e);
        }
    }
}
