package lk.ac.mrt.cse.hai.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.amazonaws.services.lambda.runtime.Context;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

/**
 * Sends real ALB-format events through the Lambda entry point, as the internal ALB will in AWS.
 * Guards the "Lambda behind an ALB, no API Gateway" decision (ADR-17).
 */
class LambdaHandlerAlbTest {

    private final LambdaHandler handler = new LambdaHandler();
    private final ObjectMapper json = new ObjectMapper();

    @Test
    void contactFormThroughTheAlb() throws Exception {
        JsonNode response = invoke("alb-contact-event.json");

        assertThat(response.path("statusCode").asInt()).isEqualTo(202);
        assertThat(json.readTree(response.path("body").asText()).path("success").asBoolean()).isTrue();
    }

    @Test
    void protectedRouteThroughTheAlbWithoutToken() throws Exception {
        JsonNode response = invoke("alb-unauthenticated-event.json");

        assertThat(response.path("statusCode").asInt()).isEqualTo(401);
    }

    private JsonNode invoke(String eventFile) throws Exception {
        byte[] event;
        try (InputStream in = getClass().getResourceAsStream("/" + eventFile)) {
            event = in.readAllBytes();
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        handler.handleRequest(new ByteArrayInputStream(event), out, mock(Context.class));
        return json.readTree(out.toString(StandardCharsets.UTF_8));
    }
}
