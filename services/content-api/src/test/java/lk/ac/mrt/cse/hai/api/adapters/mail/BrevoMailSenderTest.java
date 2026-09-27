package lk.ac.mrt.cse.hai.api.adapters.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import lk.ac.mrt.cse.hai.api.domain.contact.MailDeliveryException;
import lk.ac.mrt.cse.hai.api.domain.contact.OutgoingMail;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

class BrevoMailSenderTest {

    private final AtomicReference<String> apiKey = new AtomicReference<>();
    private final AtomicReference<String> body = new AtomicReference<>();
    private HttpServer server;

    private URI serve(int status) throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v3/smtp/email", exchange -> {
            apiKey.set(exchange.getRequestHeaders().getFirst("api-key"));
            body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(status, -1);
            exchange.close();
        });
        server.start();
        return URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/v3/smtp/email");
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    @Test
    void sendsToTheLabInboxWithTheVisitorAsReplyTo() throws Exception {
        var sender = new BrevoMailSender(HttpClient.newHttpClient(), serve(201), "key-123", "web@lab.example.org");

        sender.send(new OutgoingMail("lab@example.org", "asha@example.com", "Hello \"lab\"", "Line one\nLine two"));

        assertThat(apiKey.get()).isEqualTo("key-123");
        JsonNode sent = JsonMapper.builder().build().readTree(body.get());
        assertThat(sent.path("sender").path("email").asText()).isEqualTo("web@lab.example.org");
        assertThat(sent.path("to").get(0).path("email").asText()).isEqualTo("lab@example.org");
        assertThat(sent.path("replyTo").path("email").asText()).isEqualTo("asha@example.com");
        assertThat(sent.path("subject").asText()).isEqualTo("Hello \"lab\"");
        assertThat(sent.path("textContent").asText()).isEqualTo("Line one\nLine two");
    }

    @Test
    void aRefusalBecomesADeliveryFailure() throws Exception {
        var sender = new BrevoMailSender(HttpClient.newHttpClient(), serve(401), "wrong-key", "web@lab.example.org");

        assertThatThrownBy(() -> sender.send(new OutgoingMail("lab@example.org", "a@example.com", "s", "b")))
                .isInstanceOf(MailDeliveryException.class)
                .hasMessageContaining("401");
    }
}
