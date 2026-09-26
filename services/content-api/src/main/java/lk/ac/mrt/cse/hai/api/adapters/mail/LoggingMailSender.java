package lk.ac.mrt.cse.hai.api.adapters.mail;

import lk.ac.mrt.cse.hai.api.domain.contact.MailSender;
import lk.ac.mrt.cse.hai.api.domain.contact.OutgoingMail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Local runs and tests: records that a message would be sent, without its body. */
public class LoggingMailSender implements MailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingMailSender.class);

    @Override
    public void send(OutgoingMail mail) {
        log.info("Mail not sent (log provider): to={} subject={}", mail.to(), mail.subject());
    }
}
