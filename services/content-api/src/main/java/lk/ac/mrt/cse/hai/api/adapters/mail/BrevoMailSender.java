package lk.ac.mrt.cse.hai.api.adapters.mail;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lk.ac.mrt.cse.hai.api.domain.contact.MailDeliveryException;
import lk.ac.mrt.cse.hai.api.domain.contact.MailSender;
import lk.ac.mrt.cse.hai.api.domain.contact.OutgoingMail;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * Cloudflare deployment: sends through Brevo's transactional email API over HTTPS, because containers can only
 * reach ports 80 and 443. The sender address must be verified in Brevo (Senders, domains and dedicated IPs).
 */
public class BrevoMailSender implements MailSender {

    public static final URI API = URI.create("https://api.brevo.com/v3/smtp/email");

    private final HttpClient http;
    private final URI endpoint;
    private final String apiKey;
    private final String fromAddress;
    private final ObjectMapper json = JsonMapper.builder().build();

    public BrevoMailSender(HttpClient http, URI endpoint, String apiKey, String fromAddress) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("hai.mail.provider=brevo needs hai.mail.api-key (BREVO_API_KEY)");
        }
        this.http = http;
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
    }

    @Override
    public void send(OutgoingMail mail) {
        String body = json.writeValueAsString(Map.of(
                "sender", Map.of("email", fromAddress, "name", "Human-AI Lab website"),
                "to", List.of(Map.of("email", mail.to())),
                "replyTo", Map.of("email", mail.replyTo()),
                "subject", mail.subject(),
                "textContent", mail.body()));
        HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(10))
                .header("api-key", apiKey)
                .header("content-type", "application/json")
                .header("accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> response;
        try {
            response = http.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            throw new MailDeliveryException("Brevo could not be reached", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new MailDeliveryException("Interrupted while sending through Brevo", e);
        }
        if (response.statusCode() / 100 != 2) {
            throw new MailDeliveryException("Brevo did not accept the message: HTTP " + response.statusCode() + " " + response.body(), null);
        }
    }
}
