package lk.ac.mrt.cse.hai.api.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Settings injected by CDK as environment variables (see application.yml).
 *
 * @param issuerUri Cognito user pool issuer, e.g. https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_abc
 * @param clientId  Cognito app client id of the admin dashboard
 * @param mail      contact-form delivery settings
 */
@Validated
@ConfigurationProperties(prefix = "hai")
public record HaiProperties(@NotBlank String issuerUri, @NotBlank String clientId, Mail mail) {

    /**
     * @param provider    {@code ses} in AWS, {@code log} for local runs and tests
     * @param fromAddress verified SES sender
     * @param toAddress   lab inbox that receives contact messages
     */
    public record Mail(@NotBlank String provider, @NotBlank String fromAddress, @NotBlank String toAddress) {}
}
