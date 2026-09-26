package lk.ac.mrt.cse.hai.api.config;

import lk.ac.mrt.cse.hai.api.adapters.mail.LoggingMailSender;
import lk.ac.mrt.cse.hai.api.adapters.mail.SesMailSender;
import lk.ac.mrt.cse.hai.api.domain.contact.ContactService;
import lk.ac.mrt.cse.hai.api.domain.contact.MailSender;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.services.sesv2.SesV2Client;

@Configuration
public class ContactConfig {

    @Bean
    MailSender mailSender(HaiProperties properties) {
        HaiProperties.Mail mail = properties.mail();
        return switch (mail.provider()) {
            case "ses" -> new SesMailSender(
                    SesV2Client.builder().httpClient(UrlConnectionHttpClient.create()).build(), mail.fromAddress());
            case "log" -> new LoggingMailSender();
            default -> throw new IllegalStateException("Unknown hai.mail.provider: " + mail.provider());
        };
    }

    @Bean
    ContactService contactService(MailSender mailSender, HaiProperties properties) {
        return new ContactService(mailSender, properties.mail().toAddress());
    }
}
