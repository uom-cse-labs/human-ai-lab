package lk.ac.mrt.cse.hai.api.config;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Locale;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Settings injected as environment variables (see application.yml and application-cloudflare.yml).
 *
 * @param issuerUri   token issuer: the Cognito user pool in AWS, e.g. https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_abc,
 *                    or the Cloudflare Access team domain, e.g. https://hai-lab.cloudflareaccess.com
 * @param clientId    Cognito app client id of the admin dashboard, or the Cloudflare Access application's AUD tag
 * @param adminEmails Cloudflare only: people with the admin role. Everyone else Access lets in is an editor
 * @param mail        contact-form delivery settings
 */
@Validated
@ConfigurationProperties(prefix = "hai")
public record HaiProperties(@NotBlank String issuerUri, @NotBlank String clientId, List<String> adminEmails, Mail mail) {

    public boolean isAdminEmail(String email) {
        return email != null && adminEmails != null
                && adminEmails.stream().anyMatch(a -> a.trim().toLowerCase(Locale.ROOT).equals(email.toLowerCase(Locale.ROOT)));
    }

    /**
     * @param provider    {@code ses} in AWS, {@code brevo} on Cloudflare, {@code log} for local runs and tests
     * @param fromAddress sender address, verified with the provider
     * @param toAddress   lab inbox that receives contact messages
     * @param apiKey      the provider's API key, when {@code provider} is {@code brevo}
     */
    public record Mail(@NotBlank String provider, @NotBlank String fromAddress, @NotBlank String toAddress, String apiKey) {}
}
